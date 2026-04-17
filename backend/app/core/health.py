"""Health check endpoints"""
from fastapi import APIRouter

health_router = APIRouter()

@health_router.get("/health")
async def health():
    return {"status": "healthy"}
