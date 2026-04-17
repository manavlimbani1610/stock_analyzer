"""
HTTP Client with Retry and Circuit Breaker
Provides resilient HTTP calls for service-to-service communication
"""

import httpx
from typing import Optional, Dict, Any, Union
from dataclasses import dataclass
import asyncio

from .retry import RetryConfig, CircuitBreaker, async_retry


@dataclass
class HTTPResponse:
    """Standardized HTTP response wrapper"""
    status_code: int
    data: Any
    headers: Dict[str, str]
    success: bool
    error: Optional[str] = None


class ServiceClient:
    """
    HTTP client for inter-service communication
    Includes retry logic and circuit breaker
    """

    def __init__(
        self,
        base_url: str,
        timeout: float = 30.0,
        retry_config: Optional[RetryConfig] = None,
        circuit_breaker: Optional[CircuitBreaker] = None,
        default_headers: Optional[Dict[str, str]] = None,
    ):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.retry_config = retry_config or RetryConfig()
        self.circuit_breaker = circuit_breaker or CircuitBreaker()
        self.default_headers = default_headers or {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> HTTPResponse:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        request_headers = {**self.default_headers, **(headers or {})}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    headers=request_headers,
                )

                return HTTPResponse(
                    status_code=response.status_code,
                    data=response.json() if response.text else None,
                    headers=dict(response.headers),
                    success=200 <= response.status_code < 300,
                    error=None if response.status_code < 400 else response.text,
                )
            except httpx.TimeoutException:
                return HTTPResponse(
                    status_code=408,
                    data=None,
                    headers={},
                    success=False,
                    error="Request timeout",
                )
            except httpx.RequestError as e:
                return HTTPResponse(
                    status_code=500,
                    data=None,
                    headers={},
                    success=False,
                    error=str(e),
                )

    async def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> HTTPResponse:
        """GET request with retry"""
        @async_retry(self.retry_config, self.circuit_breaker)
        async def _get():
            response = await self._make_request("GET", endpoint, params=params, headers=headers)
            if not response.success:
                raise Exception(response.error)
            return response

        try:
            return await _get()
        except Exception as e:
            return HTTPResponse(
                status_code=500,
                data=None,
                headers={},
                success=False,
                error=str(e),
            )

    async def post(
        self,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> HTTPResponse:
        """POST request with retry"""
        @async_retry(self.retry_config, self.circuit_breaker)
        async def _post():
            response = await self._make_request("POST", endpoint, data=data, headers=headers)
            if not response.success:
                raise Exception(response.error)
            return response

        try:
            return await _post()
        except Exception as e:
            return HTTPResponse(
                status_code=500,
                data=None,
                headers={},
                success=False,
                error=str(e),
            )

    async def health_check(self, endpoint: str = "/health") -> bool:
        """Check service health"""
        try:
            response = await self._make_request("GET", endpoint)
            return response.success
        except Exception:
            return False


class MLServiceClient(ServiceClient):
    """
    Specialized client for ML Service communication
    """

    def __init__(self, host: str = "ml-service", port: int = 5001, **kwargs):
        super().__init__(
            base_url=f"http://{host}:{port}",
            **kwargs
        )

    async def predict(
        self,
        ticker: str,
        days: int = 30,
    ) -> HTTPResponse:
        """Get stock price prediction"""
        return await self.get(
            f"/api/predict/{ticker}",
            params={"days": days}
        )

    async def list_models(self) -> HTTPResponse:
        """List available models"""
        return await self.get("/api/models")

    async def train_model(self, ticker: str) -> HTTPResponse:
        """Train model for ticker"""
        return await self.post(f"/api/train/{ticker}")
