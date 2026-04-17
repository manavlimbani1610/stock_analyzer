"""
Trainer Service
Handles training ML models for stock prediction
Wraps the existing training logic from train_model.py
"""

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from typing import Dict, Any, Optional
import os

from app.core.model_manager import ModelManager
from config.settings import settings

# Try to import TensorFlow (optional)
try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available, using sklearn models only")


class TrainerService:
    """
    Service for training ML prediction models
    Supports both LSTM and Linear Regression models
    """

    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.sequence_length = settings.sequence_length
        self.use_lstm = settings.use_lstm and TENSORFLOW_AVAILABLE
        self.epochs = settings.epochs
        self.batch_size = settings.batch_size
        self.training_period = settings.training_period

    def train(self, ticker: str) -> Optional[Dict[str, Any]]:
        """
        Train a new model for a stock

        Args:
            ticker: Stock symbol

        Returns:
            Training result dict or None if failed
        """
        ticker = ticker.upper()
        print(f"Training model for {ticker}...")

        try:
            # Fetch data
            df = self._fetch_data(ticker)
            if df is None or df.empty:
                return None

            # Prepare data
            X_train, X_test, y_train, y_test, scaler = self._prepare_data(df)

            # Train model
            if self.use_lstm:
                model, metrics = self._train_lstm(X_train, X_test, y_train, y_test)
                model_type = 'lstm'
            else:
                model, metrics = self._train_linear_regression(X_train, X_test, y_train, y_test)
                model_type = 'linear_regression'

            # Create model data
            model_data = {
                'model': model,
                'scaler': scaler,
                'sequence_length': self.sequence_length,
                'model_type': model_type,
                'training_metrics': metrics
            }

            # Save model
            self.model_manager.save_model(ticker, model_data)

            return {
                'message': f'Model trained and saved for {ticker}',
                'ticker': ticker,
                'modelType': model_type,
                'metrics': metrics
            }

        except Exception as e:
            print(f"Error training model for {ticker}: {e}")
            return None

    def train_batch(self, tickers: list) -> Dict[str, Any]:
        """Train models for multiple tickers"""
        results = {}
        for ticker in tickers:
            result = self.train(ticker)
            results[ticker] = result if result else {'error': 'Training failed'}
        return results

    def _fetch_data(self, ticker: str) -> Optional[pd.DataFrame]:
        """Fetch historical stock data"""
        print(f"Fetching data for {ticker}...")
        try:
            stock = yf.Ticker(ticker)
            df = stock.history(period=self.training_period)

            if df.empty:
                print(f"No data found for {ticker}")
                return None

            print(f"Fetched {len(df)} data points for {ticker}")
            return df

        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")
            return None

    def _prepare_data(self, df: pd.DataFrame):
        """Prepare data for training"""
        # Use Close prices
        data = df['Close'].values.reshape(-1, 1)

        # Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)

        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i - self.sequence_length:i, 0])
            y.append(scaled_data[i, 0])

        X, y = np.array(X), np.array(y)

        # Split into train and test (80/20)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        return X_train, X_test, y_train, y_test, scaler

    def _train_linear_regression(self, X_train, X_test, y_train, y_test):
        """Train Linear Regression model"""
        print("Training Linear Regression model...")

        model = LinearRegression()
        model.fit(X_train, y_train)

        # Calculate metrics
        predictions = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        r2_score = model.score(X_test, y_test)

        metrics = {
            'rmse': float(rmse),
            'r2_score': float(r2_score)
        }

        print(f"Linear Regression Training Complete - RMSE: {rmse:.6f}")
        return model, metrics

    def _train_lstm(self, X_train, X_test, y_train, y_test):
        """Train LSTM model"""
        print("Training LSTM model...")

        # Reshape for LSTM [samples, time steps, features]
        X_train_lstm = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
        X_test_lstm = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

        # Build model
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=(X_train_lstm.shape[1], 1)),
            Dropout(0.2),
            LSTM(units=50, return_sequences=True),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=25),
            Dense(units=1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')

        # Train with early stopping
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

        history = model.fit(
            X_train_lstm, y_train,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_data=(X_test_lstm, y_test),
            callbacks=[early_stop],
            verbose=1
        )

        # Calculate metrics
        predictions = model.predict(X_test_lstm)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))

        metrics = {
            'rmse': float(rmse),
            'epochs_trained': len(history.history['loss']),
            'final_loss': float(history.history['loss'][-1]),
            'final_val_loss': float(history.history['val_loss'][-1])
        }

        print(f"LSTM Training Complete - RMSE: {rmse:.6f}")
        return model, metrics
