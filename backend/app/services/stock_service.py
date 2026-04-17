"""
Stock Data Service
Fetches real-time stock data from external APIs
"""

import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from config.settings import settings


class StockDataService:
    """
    Service for fetching stock market data from external APIs
    Primarily uses Finnhub API with fallback to mock data
    """

    def __init__(self):
        self.finnhub_key = settings.finnhub_api_key
        self.finnhub_base = "https://finnhub.io/api/v1"
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = 60  # 1 minute cache

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cache entry is still valid"""
        if cache_key not in self.cache:
            return False
        entry = self.cache[cache_key]
        return (datetime.utcnow() - entry["timestamp"]).seconds < self.cache_ttl

    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Get real-time stock quote"""
        cache_key = f"quote:{symbol}"

        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]

        if not self.finnhub_key:
            return self._mock_quote(symbol)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.finnhub_base}/quote",
                    params={"symbol": symbol.upper(), "token": self.finnhub_key},
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

                result = {
                    "symbol": symbol.upper(),
                    "price": data.get("c", 0),
                    "change": data.get("d", 0),
                    "changePercent": data.get("dp", 0),
                    "high": data.get("h", 0),
                    "low": data.get("l", 0),
                    "open": data.get("o", 0),
                    "previousClose": data.get("pc", 0),
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                }

                self.cache[cache_key] = {
                    "data": result,
                    "timestamp": datetime.utcnow(),
                }

                return result

        except Exception:
            return self._mock_quote(symbol)

    async def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        """Get company profile information"""
        cache_key = f"profile:{symbol}"

        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]["data"]

        if not self.finnhub_key:
            return self._mock_profile(symbol)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.finnhub_base}/stock/profile2",
                    params={"symbol": symbol.upper(), "token": self.finnhub_key},
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

                result = {
                    "name": data.get("name", f"{symbol} Inc."),
                    "ticker": data.get("ticker", symbol),
                    "description": data.get("description", ""),
                    "sector": data.get("finnhubIndustry", "Technology"),
                    "industry": data.get("finnhubIndustry", "Technology"),
                    "marketCap": data.get("marketCapitalization", 0),
                    "exchange": data.get("exchange", "NASDAQ"),
                    "website": data.get("weburl", ""),
                    "logo": data.get("logo", ""),
                }

                self.cache[cache_key] = {
                    "data": result,
                    "timestamp": datetime.utcnow(),
                }

                return result

        except Exception:
            return self._mock_profile(symbol)

    async def get_company_news(self, symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get company news articles"""
        if not self.finnhub_key:
            return self._mock_news(symbol)

        try:
            to_date = datetime.utcnow()
            from_date = to_date - timedelta(days=30)

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.finnhub_base}/company-news",
                    params={
                        "symbol": symbol.upper(),
                        "from": from_date.strftime("%Y-%m-%d"),
                        "to": to_date.strftime("%Y-%m-%d"),
                        "token": self.finnhub_key,
                    },
                    timeout=10.0,
                )
                response.raise_for_status()
                articles = response.json()

                return [
                    {
                        "id": str(article.get("id", i)),
                        "title": article.get("headline", ""),
                        "description": article.get("summary", ""),
                        "url": article.get("url", ""),
                        "imageUrl": article.get("image"),
                        "publishedAt": datetime.fromtimestamp(
                            article.get("datetime", 0)
                        ).isoformat() + "Z",
                        "source": article.get("source", "Finnhub"),
                        "sentiment": article.get("sentiment", "neutral"),
                    }
                    for i, article in enumerate(articles[:limit])
                ]

        except Exception:
            return self._mock_news(symbol)

    def _mock_quote(self, symbol: str) -> Dict[str, Any]:
        """Generate mock quote data"""
        import random
        base_price = 100 + random.random() * 50
        change = (random.random() - 0.5) * 10

        return {
            "symbol": symbol.upper(),
            "price": round(base_price + change, 2),
            "change": round(change, 2),
            "changePercent": round((change / base_price) * 100, 2),
            "high": round(base_price + random.random() * 5, 2),
            "low": round(base_price - random.random() * 5, 2),
            "open": round(base_price, 2),
            "previousClose": round(base_price - change, 2),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    def _mock_profile(self, symbol: str) -> Dict[str, Any]:
        """Generate mock company profile"""
        return {
            "name": f"{symbol} Inc.",
            "ticker": symbol.upper(),
            "description": f"A leading company in the technology sector.",
            "sector": "Technology",
            "industry": "Software",
            "marketCap": 1000000000000,
            "exchange": "NASDAQ",
            "website": f"https://www.{symbol.lower()}.com",
            "logo": "",
        }

    def _mock_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Generate mock news articles"""
        headlines = [
            f"{symbol} Reports Strong Quarterly Earnings",
            f"Analysts Upgrade {symbol} Price Target",
            f"{symbol} Announces New Product Line",
        ]

        return [
            {
                "id": str(i),
                "title": headline,
                "description": f"{symbol} continues to show strong performance.",
                "url": "#",
                "imageUrl": None,
                "publishedAt": (datetime.utcnow() - timedelta(days=i)).isoformat() + "Z",
                "source": ["Bloomberg", "Reuters", "CNBC"][i % 3],
                "sentiment": "positive" if i % 2 == 0 else "neutral",
            }
            for i, headline in enumerate(headlines)
        ]


# Singleton instance
stock_data_service = StockDataService()
