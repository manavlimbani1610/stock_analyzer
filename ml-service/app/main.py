"""
ML Service - Main Entry Point
Flask application serving ML model predictions
"""

import os
import pickle
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(os.path.dirname(__file__), "..", "trained_models"))
SEQUENCE_LENGTH = int(os.getenv("SEQUENCE_LENGTH", "60"))

app = Flask(__name__)
CORS(app)
models_cache = {}

def get_or_create_model(ticker):
    ticker = ticker.upper()
    if ticker in models_cache:
        return models_cache[ticker]
    model_path = os.path.join(MODELS_DIR, f"{ticker.lower()}_model.pkl")
    if os.path.exists(model_path):
        try:
            with open(model_path, "rb") as f:
                model_data = pickle.load(f)
            models_cache[ticker] = model_data
            return model_data
        except Exception as e:
            print(f"Error loading model for {ticker}: {e}")
    general_path = os.path.join(MODELS_DIR, "general_model.pkl")
    if os.path.exists(general_path):
        try:
            with open(general_path, "rb") as f:
                model_data = pickle.load(f)
            return model_data
        except Exception as e:
            print(f"Error loading general model: {e}")
    return create_quick_model(ticker)

def create_quick_model(ticker, sequence_length=None):
    if sequence_length is None:
        sequence_length = SEQUENCE_LENGTH
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period="1y")
        if df.empty:
            return None
        data = df["Close"].values.reshape(-1, 1)
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)
        X, y = [], []
        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i, 0])
            y.append(scaled_data[i, 0])
        X, y = np.array(X), np.array(y)
        model = LinearRegression()
        model.fit(X, y)
        predictions = model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, predictions))
        model_data = {
            "model": model,
            "scaler": scaler,
            "sequence_length": sequence_length,
            "model_type": "linear_regression",
            "training_metrics": {"rmse": float(rmse)}
        }
        models_cache[ticker] = model_data
        return model_data
    except Exception as e:
        print(f"Error creating model for {ticker}: {e}")
        return None

def predict_prices(ticker, model_data, days=30):
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period="6mo")
        if df.empty:
            return None
        data = df["Close"].values.reshape(-1, 1)
        scaler = model_data["scaler"]
        model = model_data["model"]
        sequence_length = model_data["sequence_length"]
        scaled_data = scaler.fit_transform(data)
        last_sequence = scaled_data[-sequence_length:]
        predictions = []
        current_sequence = last_sequence.flatten()
        for _ in range(days):
            input_seq = current_sequence.reshape(1, -1)
            pred = model.predict(input_seq)[0]
            predictions.append(pred)
            current_sequence = np.append(current_sequence[1:], pred)
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions).flatten()
        last_date = df.index[-1]
        future_dates = []
        current_date = last_date
        for _ in range(days):
            current_date += timedelta(days=1)
            while current_date.weekday() >= 5:
                current_date += timedelta(days=1)
            future_dates.append(current_date.strftime("%Y-%m-%d"))
        last_price = float(df["Close"].iloc[-1])
        avg_predicted = float(np.mean(predictions))
        trend = "bullish" if avg_predicted > last_price else "bearish"
        trend_percent = ((avg_predicted - last_price) / last_price) * 100
        returns = df["Close"].pct_change().dropna()
        volatility = float(returns.std() * np.sqrt(252) * 100)
        return {
            "ticker": ticker,
            "predictions": [{"day": i + 1, "date": future_dates[i], "predictedClose": float(predictions[i]), "confidence": max(0.5, 1 - (i / days) * 0.3)} for i in range(days)],
            "metrics": {"rmse": model_data["training_metrics"].get("rmse", 0), "lastPrice": last_price, "trend": trend, "trendPercent": round(trend_percent, 2), "volatility": round(volatility, 2), "modelType": model_data["model_type"]},
            "historicalData": [{"date": df.index[i].strftime("%Y-%m-%d"), "close": float(df["Close"].iloc[i]), "open": float(df["Open"].iloc[i]), "high": float(df["High"].iloc[i]), "low": float(df["Low"].iloc[i]), "volume": int(df["Volume"].iloc[i])} for i in range(-90, 0)]
        }
    except Exception as e:
        print(f"Error predicting for {ticker}: {e}")
        return None

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    models_list = os.listdir(MODELS_DIR) if os.path.exists(MODELS_DIR) else []
    return jsonify({"status": "healthy", "service": "ml-service", "version": "1.0.0", "environment": ENVIRONMENT, "models_loaded": len(models_cache), "models_available": models_list})

@app.route("/api/predict/<ticker>", methods=["GET"])
def predict(ticker):
    ticker = ticker.upper()
    days = request.args.get("days", 30, type=int)
    if days < 1 or days > 90:
        return jsonify({"error": "Invalid days parameter", "message": "Days must be between 1 and 90"}), 400
    model_data = get_or_create_model(ticker)
    if model_data is None:
        return jsonify({"error": f"Unable to create prediction model for {ticker}", "message": "Please check if the ticker symbol is valid"}), 400
    result = predict_prices(ticker, model_data, days)
    if result is None:
        return jsonify({"error": f"Unable to generate predictions for {ticker}", "message": "Error fetching stock data"}), 500
    return jsonify(result)

@app.route("/api/models", methods=["GET"])
def list_models():
    models = []
    if os.path.exists(MODELS_DIR):
        for filename in os.listdir(MODELS_DIR):
            if filename.endswith(".pkl"):
                models.append(filename.replace("_model.pkl", "").upper())
    return jsonify({"pretrained_models": models, "cached_models": list(models_cache.keys())})

@app.route("/api/train/<ticker>", methods=["POST"])
def train_model(ticker):
    ticker = ticker.upper()
    try:
        model_data = create_quick_model(ticker)
        if model_data is None:
            return jsonify({"error": f"Unable to train model for {ticker}"}), 400
        os.makedirs(MODELS_DIR, exist_ok=True)
        model_path = os.path.join(MODELS_DIR, f"{ticker.lower()}_model.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(model_data, f)
        return jsonify({"message": f"Model trained and saved for {ticker}", "metrics": model_data["training_metrics"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

os.makedirs(MODELS_DIR, exist_ok=True)
if os.path.exists(MODELS_DIR):
    for filename in os.listdir(MODELS_DIR):
        if filename.endswith(".pkl"):
            ticker = filename.replace("_model.pkl", "").upper()
            try:
                with open(os.path.join(MODELS_DIR, filename), "rb") as f:
                    models_cache[ticker] = pickle.load(f)
            except Exception:
                pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=DEBUG)
