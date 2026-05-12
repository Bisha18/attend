FROM python:3.11-slim

WORKDIR /app

# System dependencies for OpenCV (opencv detector backend)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Render assigns PORT dynamically
ENV PORT=8001

EXPOSE ${PORT}

# Start uvicorn — reads PORT from environment
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT}
