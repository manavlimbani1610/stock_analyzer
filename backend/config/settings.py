"""Backend configuration settings"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"
    
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"
    
    ml_service_url: str = "http://localhost:5001"
    
    finnhub_api_key: str = ""
    alpha_vantage_api_key: str = ""
    
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
