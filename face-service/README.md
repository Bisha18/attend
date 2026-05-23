---
title: GeoAttend Face Service
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# GeoAttend Face Recognition Microservice

A FastAPI-based face recognition service using DeepFace (Facenet512) and MongoDB.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/status/{student_id}` | Check if student has registered face |
| POST | `/register` | Register a student's face |
| POST | `/verify` | Verify a student's face |
| POST | `/reset-embeddings` | Wipe all embeddings (admin only) |

## Environment Variables (set in HF Spaces Secrets)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (default: `test`) |
| `THRESHOLD` | Cosine distance threshold (default: `0.55`) |
| `ADMIN_SECRET` | Secret for `/reset-embeddings` |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated (default: `*`) |
