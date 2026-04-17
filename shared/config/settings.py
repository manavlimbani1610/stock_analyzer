"""Shared settings utilities"""
import os

def get_env(key: str, default: str = "") -> str:
    return os.getenv(key, default)

def get_env_bool(key: str, default: bool = False) -> bool:
    return os.getenv(key, str(default)).lower() in ("true", "1", "yes")

def get_env_int(key: str, default: int = 0) -> int:
    return int(os.getenv(key, str(default)))
