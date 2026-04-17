"""
FastAPI Main Application Entry Point
Production-ready API server with middleware and routing
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid
import sys
import os

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'shared'))

from config.settings import settings
from app.api.v1 import router as api_router
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.core.health import health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Environment: {settings.environment}")
    print(f"Debug mode: {settings.debug}")

    yield

    # Shutdown
    print("Shutting down application...")


def create_app() -> FastAPI:
    """Application factory"""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Stock Analyzer API - Production Backend Service",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom Middleware
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RateLimiterMiddleware)

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": str(exc) if settings.debug else "An unexpected error occurred",
                "request_id": getattr(request.state, "request_id", None),
            }
        )

    # Request ID middleware
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        start_time = time.time()

        response = await call_next(request)

        process_time = time.time() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))

        return response

    # Include routers
    app.include_router(health_router, tags=["Health"])
    app.include_router(api_router, prefix="/api/v1", tags=["API v1"])

    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=1 if settings.debug else settings.workers,
    )
