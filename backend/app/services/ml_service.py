"""
ML Service Client
Handles communication with the ML microservice
"""

import httpx
from typing import Optional, Dict, Any
from config.settings import settings


class MLServiceClient:
    """
    Client for communicating with the ML prediction service
    Implements retry logic and error handling
    """

    def __init__(self):
        self.base_url = settings.ml_service_url
        self.timeout = settings.ml_service_timeout

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request to ML service"""
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.request(
                method=method,
                url=url,
                params=params,
                json=data,
            )
            response.raise_for_status()
            return response.json()

    async def health_check(self) -> Dict[str, Any]:
        """Check ML service health"""
        return await self._make_request("GET", "/api/health")

    async def get_prediction(
        self,
        ticker: str,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get stock price prediction from ML service

        Args:
            ticker: Stock ticker symbol
            days: Number of days to predict

        Returns:
            Prediction response with forecasts and metrics
        """
        return await self._make_request(
            "GET",
            f"/api/predict/{ticker}",
            params={"days": days},
        )

    async def list_models(self) -> Dict[str, Any]:
        """List available ML models"""
        return await self._make_request("GET", "/api/models")

    async def train_model(self, ticker: str) -> Dict[str, Any]:
        """
        Train a new model for a specific ticker

        Args:
            ticker: Stock ticker symbol

        Returns:
            Training result with metrics
        """
        return await self._make_request("POST", f"/api/train/{ticker}")


# Singleton instance
ml_service_client = MLServiceClient()
