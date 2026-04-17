"""ML Service configuration settings"""
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
PORT = int(os.getenv("PORT", "5001"))
MODELS_DIR = os.getenv("MODELS_DIR", "./trained_models")
SEQUENCE_LENGTH = int(os.getenv("SEQUENCE_LENGTH", "60"))
USE_LSTM = os.getenv("USE_LSTM", "false").lower() == "true"
