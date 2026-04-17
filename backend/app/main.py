"""
Backend API Service - Main Entry Point
FastAPI application that serves as the API gateway for Stock Analyzer
"""

import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"  # Enable debug by default for docs
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:5001")


# Database connection check
def check_database_connection():
    """Check if database is connected"""
    try:
        from app.db.database import test_connection
        return test_connection()
    except Exception as e:
        print(f"[DB] Connection failed: {e}")
        return False


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print(f"[STARTUP] Backend API starting in {ENVIRONMENT} mode")
    print(f"[STARTUP] ML Service URL: {ML_SERVICE_URL}")

    # Initialize database connection
    try:
        from app.db.database import test_connection
        print(f"[DB] Connecting to database...")

        # Test connection
        if test_connection():
            print(f"[DB] Database connection successful!")
        else:
            print(f"[DB] Warning: Database connection test failed")

    except Exception as e:
        print(f"[DB] Warning: Database connection failed: {e}")
        print(f"[DB] API will start but database features may not work")

    yield
    print("[SHUTDOWN] Backend API shutting down")


# Create FastAPI application
app = FastAPI(
    title="Stock Analyzer API",
    description="API Gateway for Stock Analyzer - Stock data and ML predictions",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add request ID and timing to all requests"""
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
    
    # Log request
    print(f"[{request_id}] {request.method} {request.url.path} - {response.status_code} ({process_time*1000:.2f}ms)")
    
    return response


# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    print(f"[ERROR] {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if DEBUG else "An unexpected error occurred",
        },
    )


# Health check models
class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
    services: dict[str, str]


class ReadinessResponse(BaseModel):
    status: str
    checks: dict[str, bool]


# Health endpoints
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        environment=ENVIRONMENT,
        version="1.0.0",
        services={
            "backend": "running",
            "ml_service": ML_SERVICE_URL,
            "database": "mysql",
        },
    )


@app.get("/ready", response_model=ReadinessResponse, tags=["Health"])
async def readiness_check():
    """Readiness check endpoint"""
    import httpx

    checks = {"backend": True, "ml_service": False, "database": False}

    # Check ML service
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{ML_SERVICE_URL}/health")
            checks["ml_service"] = response.status_code == 200
    except Exception:
        checks["ml_service"] = False

    # Check database
    try:
        from app.db.database import test_connection
        checks["database"] = test_connection()
    except Exception as e:
        print(f"[DB] Health check failed: {e}")
        checks["database"] = False

    all_ready = all(checks.values())

    return ReadinessResponse(
        status="ready" if all_ready else "not_ready",
        checks=checks,
    )


# Include API routes
from app.api.v1 import router as api_v1_router
app.include_router(api_v1_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "Stock Analyzer API",
        "version": "1.0.0",
        "docs": "/docs" if DEBUG else "disabled",
        "health": "/health",
    }
