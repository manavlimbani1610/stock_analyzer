"""
Stocks API Router
Handles stock data endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter()

# External API configuration
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")
FINNHUB_BASE_URL = "https://finnhub.io/api/v1"


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


class CompanyProfile(BaseModel):
    name: str
    ticker: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    marketCap: Optional[float] = None
    exchange: Optional[str] = None
    logo: Optional[str] = None
    weburl: Optional[str] = None


@router.get("/quote/{symbol}", response_model=StockQuote)
async def get_stock_quote(symbol: str):
    """Get real-time stock quote"""
    symbol = symbol.upper()
    
    if not FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{FINNHUB_BASE_URL}/quote",
                params={"symbol": symbol, "token": FINNHUB_API_KEY}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch quote")
            
            data = response.json()
            
            if data.get("c", 0) == 0:
                raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
            
            from datetime import datetime
            return StockQuote(
                symbol=symbol,
                price=data["c"],
                change=data["d"],
                changePercent=data["dp"],
                high=data["h"],
                low=data["l"],
                open=data["o"],
                previousClose=data["pc"],
                timestamp=datetime.now().isoformat()
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")


@router.get("/profile/{symbol}", response_model=CompanyProfile)
async def get_company_profile(symbol: str):
    """Get company profile information"""
    symbol = symbol.upper()
    
    if not FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{FINNHUB_BASE_URL}/stock/profile2",
                params={"symbol": symbol, "token": FINNHUB_API_KEY}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch profile")
            
            data = response.json()
            
            if not data.get("name"):
                raise HTTPException(status_code=404, detail=f"No profile found for {symbol}")
            
            return CompanyProfile(
                name=data.get("name", f"{symbol} Inc."),
                ticker=data.get("ticker", symbol),
                industry=data.get("finnhubIndustry"),
                sector=data.get("finnhubIndustry"),
                marketCap=data.get("marketCapitalization"),
                exchange=data.get("exchange"),
                logo=data.get("logo"),
                weburl=data.get("weburl")
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")


@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1, description="Search query")):
    """Search for stocks by symbol or company name"""
    if not FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="API key not configured")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{FINNHUB_BASE_URL}/search",
                params={"q": q, "token": FINNHUB_API_KEY}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Search failed")
            
            data = response.json()
            return {
                "query": q,
                "count": data.get("count", 0),
                "results": data.get("result", [])[:20]
            }
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
