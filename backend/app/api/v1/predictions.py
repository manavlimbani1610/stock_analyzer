"""
Predictions API Router
Proxies requests to ML Service
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os

router = APIRouter()

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:5001")


class PredictionPoint(BaseModel):
    day: int
    date: str
    predictedClose: float
    confidence: float


class PredictionMetrics(BaseModel):
    rmse: float
    lastPrice: float
    trend: str
    trendPercent: float
    volatility: float
    modelType: str


class HistoricalDataPoint(BaseModel):
    date: str
    close: float
    open: float
    high: float
    low: float
    volume: int


class PredictionResponse(BaseModel):
    ticker: str
    predictions: List[PredictionPoint]
    metrics: PredictionMetrics
    historicalData: List[HistoricalDataPoint]


class ModelsResponse(BaseModel):
    pretrained_models: List[str]
    cached_models: List[str]


class TrainResponse(BaseModel):
    message: str
    metrics: dict


@router.get("/predict/{ticker}", response_model=PredictionResponse)
async def get_prediction(
    ticker: str,
    days: int = Query(default=30, ge=1, le=90, description="Number of days to predict")
):
    """Get stock price predictions from ML service"""
    ticker = ticker.upper()
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.get(
                f"{ML_SERVICE_URL}/api/predict/{ticker}",
                params={"days": days}
            )
            
            if response.status_code == 400:
                data = response.json()
                raise HTTPException(status_code=400, detail=data.get("error", "Invalid request"))
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="ML service unavailable"
                )
            
            return response.json()
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """List available prediction models"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{ML_SERVICE_URL}/api/models")
            
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="ML service unavailable")
            
            return response.json()
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")


@router.post("/train/{ticker}", response_model=TrainResponse)
async def train_model(ticker: str):
    """Train a new prediction model for a specific ticker"""
    ticker = ticker.upper()
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(f"{ML_SERVICE_URL}/api/train/{ticker}")
            
            if response.status_code == 400:
                data = response.json()
                raise HTTPException(status_code=400, detail=data.get("error", "Training failed"))
            
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="ML service unavailable")
            
            return response.json()
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")


@router.get("/health")
async def ml_service_health():
    """Check ML service health"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{ML_SERVICE_URL}/api/health")
            
            if response.status_code == 200:
                return {"status": "healthy", "ml_service": response.json()}
            
            return {"status": "unhealthy", "ml_service": None}
            
    except httpx.RequestError:
        return {"status": "unavailable", "ml_service": None}
