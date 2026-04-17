"""
Pytest configuration and fixtures
"""
import pytest
import os

@pytest.fixture
def api_base_url():
    return os.getenv("API_BASE_URL", "http://localhost:8000")

@pytest.fixture
def ml_service_url():
    return os.getenv("ML_SERVICE_URL", "http://localhost:5001")

@pytest.fixture
def sample_ticker():
    return "AAPL"
