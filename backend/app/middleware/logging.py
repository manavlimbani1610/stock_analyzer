"""
Logging Middleware
Structured logging for all HTTP requests
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
from datetime import datetime


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with structured JSON output
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        request_id = getattr(request.state, "request_id", "unknown")

        # Log request
        self._log_request(request, request_id)

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log response
        self._log_response(request, response, request_id, duration_ms)

        return response

    def _log_request(self, request: Request, request_id: str):
        """Log incoming request"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "request",
            "request_id": request_id,
            "method": request.method,
            "path": str(request.url.path),
            "query": str(request.query_params),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
        }
        print(json.dumps(log_entry))

    def _log_response(self, request: Request, response: Response, request_id: str, duration_ms: float):
        """Log outgoing response"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "response",
            "request_id": request_id,
            "method": request.method,
            "path": str(request.url.path),
            "status_code": response.status_code,
            "duration_ms": round(duration_ms, 2),
        }
        print(json.dumps(log_entry))
