"""Stock-related schemas"""
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class TrendDirection(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"

class ModelType(str, Enum):
    LINEAR_REGRESSION = "linear_regression"
    LSTM = "lstm"

class StockQuote(BaseModel):
    symbol: str
    price: float
    change: float
    changePercent: float
    high: float
    low: float
    open: float
    previousClose: float
    timestamp: str

class HistoricalDataPoint(BaseModel):
    date: str
    close: float
    open: float
    high: float
    low: float
    volume: int

class CompanyProfile(BaseModel):
    name: str
    ticker: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    marketCap: Optional[float] = None
    exchange: Optional[str] = None
    logo: Optional[str] = None
    weburl: Optional[str] = None

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

class PredictionResponse(BaseModel):
    ticker: str
    predictions: List[PredictionPoint]
    metrics: PredictionMetrics
    historicalData: List[HistoricalDataPoint]

class PredictionRequest(BaseModel):
    ticker: str
    days: int = 30

class NewsArticle(BaseModel):
    id: int
    title: str
    description: str
    url: str
    publishedAt: str
    source: str

class ModelInfo(BaseModel):
    ticker: str
    modelType: str
    trainedAt: Optional[str] = None

class ModelsListResponse(BaseModel):
    pretrained_models: List[str]
    cached_models: List[str]

class TrainModelResponse(BaseModel):
    message: str
    metrics: dict

class ErrorResponse(BaseModel):
    error: str
    message: str
