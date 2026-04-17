"""
Model Manager
Handles loading, caching, and persistence of ML models
"""

import os
import pickle
from typing import Dict, Optional, Any, List
from datetime import datetime
import threading


class ModelManager:
    """
    Manages ML models including:
    - Loading from disk
    - In-memory caching
    - Model persistence
    - Model versioning
    """

    def __init__(self, models_dir: str = "trained_models"):
        self.models_dir = models_dir
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

        # Ensure directory exists
        os.makedirs(models_dir, exist_ok=True)

    def get_model(self, ticker: str) -> Optional[Dict[str, Any]]:
        """
        Get model for ticker from cache or disk

        Args:
            ticker: Stock symbol

        Returns:
            Model data dict or None if not found
        """
        ticker = ticker.upper()

        # Check cache first
        with self._lock:
            if ticker in self._cache:
                return self._cache[ticker]

        # Try to load from disk
        return self._load_from_disk(ticker)

    def save_model(self, ticker: str, model_data: Dict[str, Any]) -> bool:
        """
        Save model to cache and disk

        Args:
            ticker: Stock symbol
            model_data: Model data dict

        Returns:
            True if saved successfully
        """
        ticker = ticker.upper()

        try:
            # Add metadata
            model_data['saved_at'] = datetime.utcnow().isoformat() + "Z"
            model_data['ticker'] = ticker

            # Save to disk
            model_path = self._get_model_path(ticker)
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)

            # Update cache
            with self._lock:
                self._cache[ticker] = model_data

            print(f"Model saved for {ticker}")
            return True

        except Exception as e:
            print(f"Error saving model for {ticker}: {e}")
            return False

    def cache_model(self, ticker: str, model_data: Dict[str, Any]):
        """Add model to in-memory cache only"""
        ticker = ticker.upper()
        with self._lock:
            self._cache[ticker] = model_data

    def delete_model(self, ticker: str):
        """Remove model from cache and disk"""
        ticker = ticker.upper()

        # Remove from cache
        with self._lock:
            if ticker in self._cache:
                del self._cache[ticker]

        # Remove from disk
        model_path = self._get_model_path(ticker)
        if os.path.exists(model_path):
            os.remove(model_path)

    def list_available_models(self) -> List[str]:
        """List all models saved to disk"""
        models = []
        if os.path.exists(self.models_dir):
            for filename in os.listdir(self.models_dir):
                if filename.endswith('.pkl') and filename != 'general_model.pkl':
                    ticker = filename.replace('_model.pkl', '').upper()
                    models.append(ticker)
        return sorted(models)

    def list_cached_models(self) -> List[str]:
        """List all models in memory cache"""
        with self._lock:
            return sorted(list(self._cache.keys()))

    def get_cached_count(self) -> int:
        """Get number of models in cache"""
        with self._lock:
            return len(self._cache)

    def is_ready(self) -> bool:
        """Check if the model manager is ready"""
        return os.path.exists(self.models_dir)

    def preload_models(self):
        """Pre-load all available models into cache"""
        if not os.path.exists(self.models_dir):
            return

        for filename in os.listdir(self.models_dir):
            if filename.endswith('.pkl'):
                ticker = filename.replace('_model.pkl', '').upper()
                if ticker != 'GENERAL':
                    try:
                        self._load_from_disk(ticker)
                        print(f"Pre-loaded model for {ticker}")
                    except Exception as e:
                        print(f"Error pre-loading {ticker}: {e}")

    def get_general_model(self) -> Optional[Dict[str, Any]]:
        """Get the general-purpose model"""
        with self._lock:
            if 'GENERAL' in self._cache:
                return self._cache['GENERAL']

        general_path = os.path.join(self.models_dir, 'general_model.pkl')
        if os.path.exists(general_path):
            try:
                with open(general_path, 'rb') as f:
                    model_data = pickle.load(f)
                with self._lock:
                    self._cache['GENERAL'] = model_data
                return model_data
            except Exception as e:
                print(f"Error loading general model: {e}")

        return None

    def _get_model_path(self, ticker: str) -> str:
        """Get file path for a model"""
        return os.path.join(self.models_dir, f'{ticker.lower()}_model.pkl')

    def _load_from_disk(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Load model from disk"""
        model_path = self._get_model_path(ticker)

        if not os.path.exists(model_path):
            return None

        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)

            with self._lock:
                self._cache[ticker] = model_data

            return model_data

        except Exception as e:
            print(f"Error loading model for {ticker}: {e}")
            return None
