"""
Rate Limiter Middleware
Simple in-memory rate limiting for API protection
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict
from typing import Dict, Tuple
import asyncio

from config.settings import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Simple sliding window rate limiter
    In production, use Redis for distributed rate limiting
    """

    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, list] = defaultdict(list)
        self.max_requests = settings.rate_limit_requests
        self.window_seconds = settings.rate_limit_window
        self._lock = asyncio.Lock()

    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier"""
        # Use X-Forwarded-For if behind proxy, else use client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def _is_rate_limited(self, client_id: str) -> Tuple[bool, int]:
        """Check if client is rate limited"""
        async with self._lock:
            current_time = time.time()
            window_start = current_time - self.window_seconds

            # Filter requests within the window
            self.requests[client_id] = [
                ts for ts in self.requests[client_id]
                if ts > window_start
            ]

            request_count = len(self.requests[client_id])

            if request_count >= self.max_requests:
                # Calculate retry-after
                oldest_request = min(self.requests[client_id])
                retry_after = int(oldest_request + self.window_seconds - current_time) + 1
                return True, retry_after

            # Record this request
            self.requests[client_id].append(current_time)
            return False, 0

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health endpoints
        if request.url.path in ["/health", "/ready", "/live"]:
            return await call_next(request)

        client_id = self._get_client_id(request)
        is_limited, retry_after = await self._is_rate_limited(client_id)

        if is_limited:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": f"Rate limit exceeded. Try again in {retry_after} seconds.",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                }
            )

        response = await call_next(request)

        # Add rate limit headers
        async with self._lock:
            remaining = max(0, self.max_requests - len(self.requests[client_id]))
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
