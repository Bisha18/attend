# Hugging Face Spaces — Docker SDK
# HF Spaces always routes traffic to port 7860 internally.

FROM python:3.11-slim

# HF Spaces metadata
LABEL maintainer="GeoAttend"

WORKDIR /app

# System dependencies for OpenCV detector backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Hugging Face Spaces always uses port 7860
ENV PORT=7860

EXPOSE 7860

# Run uvicorn on the fixed HF port
CMD uvicorn app:app --host 0.0.0.0 --port 7860
