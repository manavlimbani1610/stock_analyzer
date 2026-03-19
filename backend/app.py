"""
Flask API Server for Stock Price Prediction
Serves ML model predictions to the React frontend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import pickle
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Models cache
models_cache = {}
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')


def get_or_create_model(ticker):
    """Get cached model or create a new one for the ticker"""
    ticker = ticker.upper()

    # Check if model is in cache
    if ticker in models_cache:
        return models_cache[ticker]

    # Try to load pre-trained model
    model_path = os.path.join(MODELS_DIR, f'{ticker.lower()}_model.pkl')
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            models_cache[ticker] = model_data
            print(f"Loaded pre-trained model for {ticker}")
            return model_data
        except Exception as e:
            print(f"Error loading model for {ticker}: {e}")

    # Try to load general model
    general_path = os.path.join(MODELS_DIR, 'general_model.pkl')
    if os.path.exists(general_path):
        try:
            with open(general_path, 'rb') as f:
                model_data = pickle.load(f)
            print(f"Using general model for {ticker}")
            return model_data
        except Exception as e:
            print(f"Error loading general model: {e}")

    # Create a simple model on-the-fly
    return create_quick_model(ticker)


def create_quick_model(ticker, sequence_length=60):
    """Create a quick linear regression model for a ticker"""
    print(f"Creating quick model for {ticker}...")

    try:
        # Fetch data
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
        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i, 0])
            y.append(scaled_data[i, 0])

        X, y = np.array(X), np.array(y)

        # Train simple model
        model = LinearRegression()
        model.fit(X, y)

        # Calculate RMSE
        predictions = model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, predictions))

        model_data = {
            'model': model,
            'scaler': scaler,
            'sequence_length': sequence_length,
            'model_type': 'linear_regression',
            'training_metrics': {'rmse': float(rmse)}
        }

        models_cache[ticker] = model_data
        print(f"Quick model created for {ticker} with RMSE: {rmse:.6f}")
        return model_data

    except Exception as e:
        print(f"Error creating quick model for {ticker}: {e}")
        return None


def predict_prices(ticker, model_data, days=30):
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

        for _ in range(days):
            input_seq = current_sequence.reshape(1, -1)
            pred = model.predict(input_seq)[0]
            predictions.append(pred)
            current_sequence = np.append(current_sequence[1:], pred)

        # Inverse transform
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions).flatten()

        # Generate dates (skip weekends)
        last_date = df.index[-1]
        future_dates = []
        current_date = last_date

        for _ in range(days):
            current_date += timedelta(days=1)
            while current_date.weekday() >= 5:
                current_date += timedelta(days=1)
            future_dates.append(current_date.strftime('%Y-%m-%d'))

        # Calculate trend
        last_price = float(df['Close'].iloc[-1])
        avg_predicted = float(np.mean(predictions))
        trend = 'bullish' if avg_predicted > last_price else 'bearish'
        trend_percent = ((avg_predicted - last_price) / last_price) * 100

        # Calculate volatility
        returns = df['Close'].pct_change().dropna()
        volatility = float(returns.std() * np.sqrt(252) * 100)

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
            'historicalData': [
                {
                    'date': df.index[i].strftime('%Y-%m-%d'),
                    'close': float(df['Close'].iloc[i]),
                    'open': float(df['Open'].iloc[i]),
                    'high': float(df['High'].iloc[i]),
                    'low': float(df['Low'].iloc[i]),
                    'volume': int(df['Volume'].iloc[i])
                }
                for i in range(-90, 0)
            ]
        }

    except Exception as e:
        print(f"Error predicting prices for {ticker}: {e}")
        return None


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': len(models_cache),
        'models_available': os.listdir(MODELS_DIR) if os.path.exists(MODELS_DIR) else []
    })


@app.route('/api/predict/<ticker>', methods=['GET'])
def predict(ticker):
    """Get 30-day price prediction for a stock"""
    ticker = ticker.upper()
    days = request.args.get('days', 30, type=int)

    # Get or create model
    model_data = get_or_create_model(ticker)

    if model_data is None:
        return jsonify({
            'error': f'Unable to create prediction model for {ticker}',
            'message': 'Please check if the ticker symbol is valid'
        }), 400

    # Generate predictions
    result = predict_prices(ticker, model_data, days)

    if result is None:
        return jsonify({
            'error': f'Unable to generate predictions for {ticker}',
            'message': 'Error fetching stock data'
        }), 500

    return jsonify(result)


@app.route('/api/models', methods=['GET'])
def list_models():
    """List available pre-trained models"""
    models = []
    if os.path.exists(MODELS_DIR):
        for filename in os.listdir(MODELS_DIR):
            if filename.endswith('.pkl'):
                ticker = filename.replace('_model.pkl', '').upper()
                models.append(ticker)

    return jsonify({
        'pretrained_models': models,
        'cached_models': list(models_cache.keys())
    })


@app.route('/api/train/<ticker>', methods=['POST'])
def train_model(ticker):
    """Train a new model for a specific ticker"""
    ticker = ticker.upper()

    try:
        model_data = create_quick_model(ticker)

        if model_data is None:
            return jsonify({
                'error': f'Unable to train model for {ticker}'
            }), 400

        # Save the model
        os.makedirs(MODELS_DIR, exist_ok=True)
        model_path = os.path.join(MODELS_DIR, f'{ticker.lower()}_model.pkl')

        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)

        return jsonify({
            'message': f'Model trained and saved for {ticker}',
            'metrics': model_data['training_metrics']
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Ensure models directory exists
    os.makedirs(MODELS_DIR, exist_ok=True)

    print("Starting Stock Prediction API Server...")
    print(f"Models directory: {MODELS_DIR}")

    # Pre-load any existing models
    if os.path.exists(MODELS_DIR):
        for filename in os.listdir(MODELS_DIR):
            if filename.endswith('.pkl'):
                ticker = filename.replace('_model.pkl', '').upper()
                try:
                    with open(os.path.join(MODELS_DIR, filename), 'rb') as f:
                        models_cache[ticker] = pickle.load(f)
                    print(f"Pre-loaded model for {ticker}")
                except Exception as e:
                    print(f"Error loading {filename}: {e}")

    app.run(host='0.0.0.0', port=5000, debug=True)
