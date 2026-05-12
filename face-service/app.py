"""
GeoAttend Face Recognition Microservice
========================================
Production-ready FastAPI service optimized for Render free tier (512MB RAM).
Uses DeepFace/Facenet with opencv detector for minimal resource consumption.
"""

import os

# ── Suppress TensorFlow / CUDA noise BEFORE any other imports ────────────────
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import gc
import base64
import logging
import threading
import time
import numpy as np
import httpx
from io import BytesIO
from dotenv import load_dotenv
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from pymongo import MongoClient

# ── Config ───────────────────────────────────────────────────────────────────
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test")
THRESHOLD = float(os.getenv("THRESHOLD", "0.55"))
MODEL_NAME = "Facenet512"  # ~95MB weights — already cached, compatible with existing embeddings
DETECTOR = "opencv"  # Lightest detector — no extra model download
SELF_URL = os.getenv("SELF_URL", "").rstrip("/")
KEEP_ALIVE_INTERVAL = int(os.getenv("KEEP_ALIVE_INTERVAL", "840"))  # 14 min
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "geoattend-reset-2026")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
IMG_SIZE = 224  # Facenet expects 160x160 but we resize to 224 for detection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("face")

# ── Singleton Model Lock ────────────────────────────────────────────────────
_model_lock = threading.Lock()
_model_ready = threading.Event()
DeepFace = None  # Lazy-loaded singleton


def _load_deepface():
    """Import and pre-warm DeepFace exactly once. Thread-safe."""
    global DeepFace
    with _model_lock:
        if DeepFace is not None:
            return  # Already loaded by another thread
        log.info("⏳ Loading DeepFace + TensorFlow (background)...")
        try:
            from deepface import DeepFace as _DF
            DeepFace = _DF

            # Pre-warm: run a dummy inference to load weights into memory
            dummy = np.zeros((160, 160, 3), dtype=np.uint8)
            DeepFace.represent(
                dummy,
                model_name=MODEL_NAME,
                detector_backend=DETECTOR,
                enforce_detection=False,
            )
            log.info("✅ DeepFace model loaded and pre-warmed.")

            # Force garbage collection after initial load
            gc.collect()
        except Exception as e:
            log.error(f"❌ Model pre-warm failed: {e}")
    _model_ready.set()


def _get_deepface():
    """Get the DeepFace singleton. Blocks until ready if still loading."""
    global DeepFace
    if DeepFace is None:
        if not _model_ready.is_set():
            log.info("⏳ Waiting for model to finish loading...")
            _model_ready.wait(timeout=120)
        if DeepFace is None:
            # Fallback: load synchronously if background thread failed
            _load_deepface()
    if DeepFace is None:
        raise HTTPException(
            status_code=503,
            detail="Face recognition model is still loading. Please retry in 30 seconds.",
        )
    return DeepFace


# ── MongoDB ──────────────────────────────────────────────────────────────────
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        maxPoolSize=5,  # Minimize connection overhead on free tier
    )
    db = client[DB_NAME]
    faces_col = db["face_embeddings"]
    faces_col.create_index("student_id", unique=True)
    log.info("✅ MongoDB connected.")
except Exception as e:
    log.error(f"❌ MongoDB connection failed: {e}")
    client = None
    db = None
    faces_col = None


# ── Keep-Alive (prevents Render free-tier sleep) ────────────────────────────
def _keep_alive_loop():
    """Self-ping /health every KEEP_ALIVE_INTERVAL seconds."""
    while True:
        time.sleep(KEEP_ALIVE_INTERVAL)
        if not SELF_URL:
            continue
        try:
            r = httpx.get(f"{SELF_URL}/health", timeout=15)
            log.info(f"🏓 Keep-alive → {r.status_code}")
        except Exception as e:
            log.warning(f"🏓 Keep-alive failed: {e}")


# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="GeoAttend Face Service",
    version="2.0.0",
    docs_url="/docs",
    redoc_url=None,  # Save memory — disable redoc
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """
    Bind the port IMMEDIATELY, then load the heavy ML model in a background
    thread. This prevents Render from killing the service during cold starts
    (Render requires a health-check response within ~30s of boot).
    """
    # Background model warmup — non-blocking
    threading.Thread(target=_load_deepface, daemon=True).start()
    log.info("⚡ Server is UP — model loading in background...")

    # Keep-alive cron
    if SELF_URL:
        threading.Thread(target=_keep_alive_loop, daemon=True).start()
        log.info(f"🏓 Keep-alive started → pinging {SELF_URL} every {KEEP_ALIVE_INTERVAL}s")


# ── Request Schemas ──────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    student_id: str
    image: str  # base64 from app camera

    @field_validator("student_id")
    @classmethod
    def student_id_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("student_id cannot be empty")
        return v.strip()

    @field_validator("image")
    @classmethod
    def image_not_empty(cls, v):
        if not v or len(v) < 100:
            raise ValueError("image data is missing or too short")
        return v


class VerifyRequest(BaseModel):
    student_id: str
    image: str  # base64 from app camera

    @field_validator("student_id")
    @classmethod
    def student_id_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("student_id cannot be empty")
        return v.strip()

    @field_validator("image")
    @classmethod
    def image_not_empty(cls, v):
        if not v or len(v) < 100:
            raise ValueError("image data is missing or too short")
        return v


# ── Helpers ──────────────────────────────────────────────────────────────────

def _decode_base64_to_array(b64: str) -> np.ndarray:
    """
    Decode a base64 image string → numpy BGR array (DeepFace expects BGR).
    Resizes to IMG_SIZE to reduce memory and processing time.
    """
    # Strip data URI prefix if present
    if "," in b64 and b64.startswith("data:"):
        b64 = b64.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 encoding.")

    try:
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot decode image. Ensure it is a valid JPEG/PNG.")

    # Resize to reduce memory (keeps aspect ratio via thumbnail then pad)
    img.thumbnail((IMG_SIZE, IMG_SIZE), Image.LANCZOS)

    img_array = np.array(img)
    # Convert RGB → BGR for DeepFace
    return img_array[:, :, ::-1]


def _get_embedding(img_array: np.ndarray) -> list:
    """Extract face embedding using the cached DeepFace singleton."""
    df = _get_deepface()
    try:
        results = df.represent(
            img_path=img_array,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR,
            enforce_detection=True,
        )
    except ValueError as e:
        log.warning(f"No face detected: {e}")
        raise HTTPException(
            status_code=400,
            detail="No face detected in the image. Please ensure your face is clearly visible.",
        )
    except Exception as e:
        log.error(f"DeepFace error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Face detection error: {str(e)}",
        )

    if len(results) > 1:
        raise HTTPException(
            status_code=400,
            detail="Multiple faces detected. Please ensure only one face is visible.",
        )

    return results[0]["embedding"]


def _cosine_distance(a: list, b: list) -> float:
    """Cosine distance: 0 = identical, 2 = opposite."""
    if len(a) != len(b):
        log.warning(f"Embedding dimension mismatch: {len(a)} vs {len(b)}")
        return 2.0
    a_arr, b_arr = np.array(a, dtype=np.float32), np.array(b, dtype=np.float32)
    dot = np.dot(a_arr, b_arr)
    norm = np.linalg.norm(a_arr) * np.linalg.norm(b_arr)
    if norm == 0:
        return 2.0
    return float(1.0 - (dot / norm))


def _ensure_db():
    """Raise 503 if MongoDB is unavailable."""
    if faces_col is None:
        raise HTTPException(status_code=503, detail="Database unavailable. Please retry later.")


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Quick health check — Render pings this to verify the service is alive."""
    mongo_ok = False
    model_ok = DeepFace is not None
    try:
        if client:
            client.admin.command("ping")
            mongo_ok = True
    except Exception:
        pass

    status = "ok" if (mongo_ok and model_ok) else "warming" if not model_ok else "degraded"
    return {
        "status": status,
        "model": "loaded" if model_ok else "loading",
        "mongo": "connected" if mongo_ok else "disconnected",
    }


@app.get("/status/{student_id}")
def face_status(student_id: str):
    """Check if a student has a registered face embedding."""
    _ensure_db()
    doc = faces_col.find_one({"student_id": student_id}, {"_id": 1})
    return {"registered": doc is not None}


@app.post("/register")
def register_face(req: RegisterRequest):
    """
    Register a student's face with duplicate-face detection.
    Prevents the same physical face from being registered to multiple accounts.
    """
    _ensure_db()
    log.info(f"📸 Registering face for student: {req.student_id}")

    # 1. Decode image
    img = _decode_base64_to_array(req.image)

    # 2. Generate embedding
    embedding = _get_embedding(img)

    # 3. Check for duplicate faces across all registered students
    all_faces = list(faces_col.find({}, {"student_id": 1, "embedding": 1}))
    for doc in all_faces:
        if "embedding" in doc and doc["student_id"] != req.student_id:
            dist = _cosine_distance(embedding, doc["embedding"])
            if dist < THRESHOLD:
                log.warning(f"⚠️ Duplicate face! Matches student: {doc['student_id']}")
                raise HTTPException(
                    status_code=409,
                    detail=f"Face already registered to another account ({doc['student_id']}).",
                )

    # 4. Store in MongoDB (upsert — allows re-registration)
    faces_col.update_one(
        {"student_id": req.student_id},
        {"$set": {"student_id": req.student_id, "embedding": embedding}},
        upsert=True,
    )

    log.info(f"✅ Face registered for {req.student_id}")

    # Garbage collect after heavy operation
    gc.collect()

    return {"success": True, "message": f"Face registered for student {req.student_id}"}


@app.post("/verify")
def verify_face(req: VerifyRequest):
    """
    Verify a student's face (1:1 match).
    Compares live selfie embedding against stored embedding using cosine distance.
    """
    _ensure_db()
    log.info(f"🔍 Verifying face for student: {req.student_id}")

    # 1. Fetch stored embedding
    doc = faces_col.find_one({"student_id": req.student_id})
    if not doc or "embedding" not in doc:
        raise HTTPException(
            status_code=404,
            detail=f"No registered face for student '{req.student_id}'.",
        )

    # 2. Decode live image
    img = _decode_base64_to_array(req.image)

    # 3. Generate embedding for live selfie
    captured_embedding = _get_embedding(img)

    # 4. Compare (cosine distance)
    distance = _cosine_distance(captured_embedding, doc["embedding"])
    confidence = round(1.0 - distance, 4)
    verified = distance <= THRESHOLD

    emoji = "✅" if verified else "❌"
    log.info(f"{emoji} student={req.student_id} confidence={confidence:.2%} distance={distance:.4f}")

    # Garbage collect after heavy operation
    gc.collect()

    return {
        "verified": bool(verified),
        "confidence": float(confidence),
        "message": "Face matched" if verified else f"Face mismatch (distance={distance:.4f}, threshold={THRESHOLD})",
    }


@app.post("/reset-embeddings")
def reset_embeddings(secret: str = ""):
    """Wipe all face embeddings. Protected by ADMIN_SECRET."""
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret.")
    _ensure_db()
    result = faces_col.delete_many({})
    log.info(f"🗑️ Cleared {result.deleted_count} face embeddings")
    return {"success": True, "deleted": result.deleted_count}


# ── Direct Execution ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
