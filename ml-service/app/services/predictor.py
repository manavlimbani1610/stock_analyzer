"""
Predictor Service
Handles stock price predictions using trained ML models
Wraps the existing prediction logic without modification
"""

import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from typing import Dict, Any, Optional, List

from app.core.model_manager import ModelManager
from config.settings import settings


class PredictorService:
    """
    Service for generating stock price predictions
    Uses pre-trained models or creates new ones on-the-fly
    """

    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.sequence_length = settings.sequence_length

    def predict(self, ticker: str, days: int = 30) -> Optional[Dict[str, Any]]:
        """
        Generate price predictions for a stock

        Args:
            ticker: Stock symbol
            days: Number of days to predict

        Returns:
            Prediction result dict or None if failed
        """
        ticker = ticker.upper()

        # Get or create model
        model_data = self._get_or_create_model(ticker)
        if model_data is None:
            return None

        # Generate predictions
        return self._generate_predictions(ticker, model_data, days)

    def _get_or_create_model(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get cached model or create a new one"""
        # Try to get existing model
        model_data = self.model_manager.get_model(ticker)
        if model_data is not None:
            return model_data

        # Try general model
        general_model = self.model_manager.get_general_model()
        if general_model is not None:
            return general_model

        # Create quick model on-the-fly
        return self._create_quick_model(ticker)

    def _create_quick_model(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Create a quick linear regression model"""
        print(f"Creating quick model for {ticker}...")

        try:
            # Fetch data using yfinance
            stock = yf.Ticker(ticker)
            df = stock.history(period='1y')

            if df.empty:
                return None

            # Prepare data
            data = df['Close'].values.reshape(-1, 1)
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(data)

            # Create sequences
            X, y = [], []
            for i in range(self.sequence_length, len(scaled_data)):
                X.append(scaled_data[i - self.sequence_length:i, 0])
                y.append(scaled_data[i, 0])

            X, y = np.array(X), np.array(y)

            # Train simple linear regression model
            model = LinearRegression()
            model.fit(X, y)

            # Calculate RMSE
            predictions = model.predict(X)
            rmse = np.sqrt(mean_squared_error(y, predictions))

            model_data = {
                'model': model,
                'scaler': scaler,
                'sequence_length': self.sequence_length,
                'model_type': 'linear_regression',
                'training_metrics': {'rmse': float(rmse)}
            }

            # Cache the model
            self.model_manager.cache_model(ticker, model_data)

            print(f"Quick model created for {ticker} with RMSE: {rmse:.6f}")
            return model_data

        except Exception as e:
            print(f"Error creating quick model for {ticker}: {e}")
            return None

    def _generate_predictions(
        self,
        ticker: str,
        model_data: Dict[str, Any],
        days: int
    ) -> Optional[Dict[str, Any]]:
        """Generate price predictions using the model"""
        try:
            # Fetch recent data
            stock = yf.Ticker(ticker)
            df = stock.history(period='6mo')

            if df.empty:
                return None

            data = df['Close'].values.reshape(-1, 1)
            scaler = model_data['scaler']
            model = model_data['model']
            sequence_length = model_data['sequence_length']

            # Fit scaler on new data
            scaled_data = scaler.fit_transform(data)

            # Get last sequence
            last_sequence = scaled_data[-sequence_length:]
            predictions = []
            current_sequence = last_sequence.flatten()

            # Generate predictions
            for _ in range(days):
                input_seq = current_sequence.reshape(1, -1)
                pred = model.predict(input_seq)[0]
                predictions.append(pred)
                current_sequence = np.append(current_sequence[1:], pred)

            # Inverse transform predictions
            predictions = np.array(predictions).reshape(-1, 1)
            predictions = scaler.inverse_transform(predictions).flatten()

            # Generate dates (skip weekends)
            last_date = df.index[-1]
            future_dates = self._generate_future_dates(last_date, days)

            # Calculate metrics
            last_price = float(df['Close'].iloc[-1])
            avg_predicted = float(np.mean(predictions))
            trend = 'bullish' if avg_predicted > last_price else 'bearish'
            trend_percent = ((avg_predicted - last_price) / last_price) * 100

            # Calculate volatility
            returns = df['Close'].pct_change().dropna()
            volatility = float(returns.std() * np.sqrt(252) * 100)

            # Prepare historical data
            historical_data = self._format_historical_data(df)

            return {
                'ticker': ticker,
                'predictions': [
                    {
                        'day': i + 1,
                        'date': future_dates[i],
                        'predictedClose': float(predictions[i]),
                        'confidence': max(0.5, 1 - (i / days) * 0.3)
                    }
                    for i in range(days)
                ],
                'metrics': {
                    'rmse': model_data['training_metrics'].get('rmse', 0),
                    'lastPrice': last_price,
                    'trend': trend,
                    'trendPercent': round(trend_percent, 2),
                    'volatility': round(volatility, 2),
                    'modelType': model_data['model_type']
                },
                'historicalData': historical_data
            }

        except Exception as e:
            print(f"Error predicting prices for {ticker}: {e}")
            return None

    def _generate_future_dates(self, last_date, days: int) -> List[str]:
        """Generate future trading dates (skip weekends)"""
        future_dates = []
        current_date = last_date

        for _ in range(days):
            current_date += timedelta(days=1)
            while current_date.weekday() >= 5:  # Skip weekends
                current_date += timedelta(days=1)
            future_dates.append(current_date.strftime('%Y-%m-%d'))

        return future_dates

    def _format_historical_data(self, df) -> List[Dict[str, Any]]:
        """Format historical data for response"""
        # Get last 90 days
        return [
            {
                'date': df.index[i].strftime('%Y-%m-%d'),
                'close': float(df['Close'].iloc[i]),
                'open': float(df['Open'].iloc[i]),
                'high': float(df['High'].iloc[i]),
                'low': float(df['Low'].iloc[i]),
                'volume': int(df['Volume'].iloc[i])
            }
            for i in range(-min(90, len(df)), 0)
        ]
