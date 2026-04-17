# ML Service Dockerfile
# Multi-stage build for optimized production image

FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Production stage
FROM python:3.11-slim AS production

WORKDIR /app

# Create non-root user for security
RUN groupadd -r mluser && useradd -r -g mluser mluser

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install dependencies
RUN pip install --no-cache /wheels/*

# Copy application code
COPY ./app ./app
COPY ./config ./config
COPY ./trained_models ./trained_models

# Create models directory with proper permissions
RUN mkdir -p /app/trained_models && chown -R mluser:mluser /app

# Switch to non-root user
USER mluser

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=5001
ENV MODELS_DIR=/app/trained_models

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health')" || exit 1

# Run the application
CMD ["gunicorn", "app.main:app", "-w", "2", "-b", "0.0.0.0:5001", "--timeout", "120"]
