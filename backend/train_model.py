"""
Stock Price Prediction Model Training Script
Uses LSTM and Linear Regression for 30-day price forecasting
"""

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import pickle
import os
from datetime import datetime, timedelta

# Try to import tensorflow, fall back to sklearn if not available
try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available, using sklearn models only")


class StockPredictionModel:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        self.model_type = None
        self.training_metrics = {}

    def fetch_data(self, ticker, period='2y'):
        """Fetch historical stock data using yfinance"""
        print(f"Fetching data for {ticker}...")
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)

        if df.empty:
            raise ValueError(f"No data found for ticker {ticker}")

        print(f"Fetched {len(df)} data points for {ticker}")
        return df

    def prepare_data(self, df):
        """Prepare data for training"""
        # Use Close prices
        data = df['Close'].values.reshape(-1, 1)

        # Scale the data
        scaled_data = self.scaler.fit_transform(data)

        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i, 0])
            y.append(scaled_data[i, 0])

        X, y = np.array(X), np.array(y)

        # Split into train and test (80/20)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        return X_train, X_test, y_train, y_test

    def build_lstm_model(self, input_shape):
        """Build LSTM model for time series prediction"""
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(units=50, return_sequences=True),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=25),
            Dense(units=1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model

    def train_lstm(self, X_train, X_test, y_train, y_test, epochs=50, batch_size=32):
        """Train LSTM model"""
        print("Training LSTM model...")

        # Reshape for LSTM [samples, time steps, features]
        X_train_lstm = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
        X_test_lstm = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

        self.model = self.build_lstm_model((X_train_lstm.shape[1], 1))

        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

        history = self.model.fit(
            X_train_lstm, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test_lstm, y_test),
            callbacks=[early_stop],
            verbose=1
        )

        # Calculate metrics
        predictions = self.model.predict(X_test_lstm)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))

        self.model_type = 'lstm'
        self.training_metrics = {
            'rmse': float(rmse),
            'epochs_trained': len(history.history['loss']),
            'final_loss': float(history.history['loss'][-1]),
            'final_val_loss': float(history.history['val_loss'][-1])
        }

        print(f"LSTM Training Complete - RMSE: {rmse:.6f}")
        return self.training_metrics

    def train_linear_regression(self, X_train, X_test, y_train, y_test):
        """Train Linear Regression model (fallback)"""
        print("Training Linear Regression model...")

        self.model = LinearRegression()
        self.model.fit(X_train, y_train)

        # Calculate metrics
        predictions = self.model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))

        self.model_type = 'linear_regression'
        self.training_metrics = {
            'rmse': float(rmse),
            'r2_score': float(self.model.score(X_test, y_test))
        }

        print(f"Linear Regression Training Complete - RMSE: {rmse:.6f}")
        return self.training_metrics

    def train(self, ticker, use_lstm=True):
        """Main training method"""
        # Fetch and prepare data
        df = self.fetch_data(ticker)
        X_train, X_test, y_train, y_test = self.prepare_data(df)

        # Train model
        if use_lstm and TENSORFLOW_AVAILABLE:
            metrics = self.train_lstm(X_train, X_test, y_train, y_test)
        else:
            metrics = self.train_linear_regression(X_train, X_test, y_train, y_test)

        return metrics

    def predict_future(self, ticker, days=30):
        """Predict future stock prices"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        # Fetch recent data
        df = self.fetch_data(ticker, period='6mo')
        data = df['Close'].values.reshape(-1, 1)
        scaled_data = self.scaler.transform(data)

        # Get the last sequence
        last_sequence = scaled_data[-self.sequence_length:]
        predictions = []
        current_sequence = last_sequence.copy()

        for _ in range(days):
            if self.model_type == 'lstm':
                # Reshape for LSTM
                input_seq = current_sequence.reshape((1, self.sequence_length, 1))
                pred = self.model.predict(input_seq, verbose=0)[0, 0]
            else:
                # Linear regression
                input_seq = current_sequence.flatten().reshape(1, -1)
                pred = self.model.predict(input_seq)[0]

            predictions.append(pred)

            # Update sequence
            current_sequence = np.append(current_sequence[1:], [[pred]], axis=0)

        # Inverse transform predictions
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = self.scaler.inverse_transform(predictions)

        # Generate dates (skip weekends)
        last_date = df.index[-1]
        future_dates = []
        current_date = last_date

        for _ in range(days):
            current_date += timedelta(days=1)
            while current_date.weekday() >= 5:  # Skip weekends
                current_date += timedelta(days=1)
            future_dates.append(current_date.strftime('%Y-%m-%d'))

        return {
            'dates': future_dates,
            'predictions': predictions.flatten().tolist(),
            'last_price': float(df['Close'].iloc[-1]),
            'model_type': self.model_type,
            'metrics': self.training_metrics
        }

    def save(self, filepath):
        """Save model to pickle file"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'sequence_length': self.sequence_length,
            'model_type': self.model_type,
            'training_metrics': self.training_metrics
        }

        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        print(f"Model saved to {filepath}")

    @classmethod
    def load(cls, filepath):
        """Load model from pickle file"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        instance = cls(sequence_length=model_data['sequence_length'])
        instance.model = model_data['model']
        instance.scaler = model_data['scaler']
        instance.model_type = model_data['model_type']
        instance.training_metrics = model_data['training_metrics']

        print(f"Model loaded from {filepath}")
        return instance


def train_and_save_models(tickers=['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']):
    """Train and save models for multiple tickers"""
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)

    for ticker in tickers:
        print(f"\n{'='*50}")
        print(f"Training model for {ticker}")
        print('='*50)

        try:
            model = StockPredictionModel(sequence_length=60)
            metrics = model.train(ticker, use_lstm=TENSORFLOW_AVAILABLE)

            # Save model
            model_path = os.path.join(models_dir, f'{ticker.lower()}_model.pkl')
            model.save(model_path)

            print(f"Successfully trained and saved model for {ticker}")
            print(f"Metrics: {metrics}")

        except Exception as e:
            print(f"Error training model for {ticker}: {e}")

    # Also save a general-purpose model
    print(f"\n{'='*50}")
    print("Training general-purpose model (SPY)")
    print('='*50)

    try:
        general_model = StockPredictionModel(sequence_length=60)
        general_model.train('SPY', use_lstm=TENSORFLOW_AVAILABLE)
        general_model.save(os.path.join(models_dir, 'general_model.pkl'))
    except Exception as e:
        print(f"Error training general model: {e}")


if __name__ == '__main__':
    # Train models for popular stocks
    train_and_save_models(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'])
