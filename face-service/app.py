"""
Face Recognition Microservice — Minimal & Lightweight
=====================================================
Endpoints:
  POST /register  — Register a student's face (base64 image from app camera)
  POST /verify    — Verify a student's face against stored embedding (1:1)
  GET  /health    — Health check

Run:
  uvicorn app:app --host 0.0.0.0 --port 8001 --reload
"""

import os
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
from pydantic import BaseModel
from pymongo import MongoClient
from deepface import DeepFace

# ── Config ───────────────────────────────────────────────────────────────────
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test")
THRESHOLD = float(os.getenv("THRESHOLD", "0.55"))  # cosine distance threshold
MODEL_NAME = "Facenet512"
SELF_URL = os.getenv("SELF_URL", "")  # e.g. https://your-app.onrender.com
KEEP_ALIVE_INTERVAL = int(os.getenv("KEEP_ALIVE_INTERVAL", "30"))  # seconds (30s)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(message)s")
log = logging.getLogger("face")

# ── MongoDB ──────────────────────────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
faces_col = db["face_embeddings"]
faces_col.create_index("student_id", unique=True)

# ── Keep-Alive Cron (prevents free-tier sleep) ───────────────────────────────
def keep_alive_loop():
    """Self-ping /health every KEEP_ALIVE_INTERVAL seconds to prevent cold shutdown."""
    while True:
        time.sleep(KEEP_ALIVE_INTERVAL)
        if not SELF_URL:
            continue
        try:
            r = httpx.get(f"{SELF_URL}/health", timeout=15)
            log.info(f"🏓 Keep-alive ping → {r.status_code}")
        except Exception as e:
            log.warning(f"🏓 Keep-alive ping failed: {e}")

# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(title="Face Recognition Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Pre-warm model in background so port binds immediately (Render requirement)
    def _prewarm():
        log.info("Pre-warming DeepFace model (background)...")
        try:
            dummy = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.represent(dummy, model_name=MODEL_NAME, detector_backend="opencv", enforce_detection=False)
            log.info("✅ DeepFace model pre-warmed.")
        except Exception as e:
            log.warning(f"Pre-warm failed: {e}")

    threading.Thread(target=_prewarm, daemon=True).start()

    # Start keep-alive background thread
    if SELF_URL:
        t = threading.Thread(target=keep_alive_loop, daemon=True)
        t.start()
        log.info(f"🏓 Keep-alive cron started — pinging {SELF_URL} every {KEEP_ALIVE_INTERVAL}s")



# ── Schemas ──────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    student_id: str
    image: str  # base64 from app camera


class VerifyRequest(BaseModel):
    student_id: str
    image: str  # base64 from app camera


# ── Helpers ──────────────────────────────────────────────────────────────────

def decode_base64_to_array(b64: str) -> np.ndarray:
    """Decode a base64 image string to a numpy BGR array (expected by DeepFace)."""
    # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    if "," in b64 and b64.startswith("data:"):
        b64 = b64.split(",", 1)[1]

    img_bytes = base64.b64decode(b64)
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img_array = np.array(img)
    # Convert RGB to BGR for DeepFace
    return img_array[:, :, ::-1]


def get_embedding(img_array: np.ndarray) -> list:
    """Extract face embedding from image using DeepFace."""
    try:
        results = DeepFace.represent(
            img_path=img_array,
            model_name=MODEL_NAME,
            detector_backend="opencv",
            enforce_detection=True,
        )
    except ValueError as e:
        log.error(f"DeepFace ValueError: {e}")
        raise HTTPException(status_code=400, detail="No face detected in the image.")
    except Exception as e:
        log.error(f"DeepFace Unexpected Error: {e}")
        raise HTTPException(status_code=400, detail=f"Error detecting face: {str(e)}")

    if len(results) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please ensure only one face is visible.")

    # Return the first face's embedding
    return results[0]["embedding"]


def cosine_distance(a: list, b: list) -> float:
    """Cosine distance between two vectors. 0 = identical, 2 = opposite."""
    a, b = np.array(a), np.array(b)
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 2.0
    return 1.0 - (dot / norm)


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Quick health check."""
    try:
        client.admin.command("ping")
        return {"status": "ok", "mongo": "connected"}
    except Exception:
        return {"status": "degraded", "mongo": "disconnected"}


@app.get("/status/{student_id}")
def face_status(student_id: str):
    """Check if a student has a registered face embedding."""
    doc = faces_col.find_one({"student_id": student_id}, {"_id": 1})
    return {"registered": doc is not None}


@app.post("/register")
def register_face(req: RegisterRequest):
    """
    Register a student's face with duplicate check.
    """
    log.info(f"Registering face for student: {req.student_id}")

    # Decode image
    try:
        img = decode_base64_to_array(req.image)
    except Exception as e:
        log.error(f"Image decode error: {e}")
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    # Generate embedding
    try:
        embedding = get_embedding(img)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during face detection.")

    # Check for duplicates across all registered faces
    all_faces = list(faces_col.find({}))
    for doc in all_faces:
        if "embedding" in doc and doc["student_id"] != req.student_id:
            dist = cosine_distance(embedding, doc["embedding"])
            if dist < THRESHOLD:
                log.warning(f"Duplicate face detected! Matches student: {doc['student_id']}")
                raise HTTPException(status_code=409, detail=f"Face already registered to another account ({doc['student_id']}).")

    # Store in MongoDB (upsert)
    faces_col.update_one(
        {"student_id": req.student_id},
        {"$set": {"student_id": req.student_id, "embedding": embedding}},
        upsert=True,
    )

    log.info(f"✅ Face registered for {req.student_id}")
    return {"success": True, "message": f"Face registered for student {req.student_id}"}


@app.post("/verify")
def verify_face(req: VerifyRequest):
    """
    Verify a student's face (1:1 match).
    - Decodes base64 image from app camera
    - Generates embedding
    - Compares with stored embedding for that student_id
    """
    log.info(f"Verifying face for student: {req.student_id}")

    # Check if student is registered
    doc = faces_col.find_one({"student_id": req.student_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"No registered face for student '{req.student_id}'.")

    # Decode image
    try:
        img = decode_base64_to_array(req.image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    # Generate embedding for captured image
    captured_embedding = get_embedding(img)

    # Compare (cosine distance)
    distance = cosine_distance(captured_embedding, doc["embedding"])
    confidence = round(1.0 - distance, 4)  # convert distance to similarity
    verified = distance <= THRESHOLD

    log.info(f"{'✅' if verified else '❌'} student={req.student_id} confidence={confidence:.2%} distance={distance:.4f}")

    return {
        "verified": bool(verified),
        "confidence": float(confidence),
        "message": "Face matched" if verified else f"Face mismatch (distance={distance:.4f}, threshold={THRESHOLD})",
    }


# ── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
