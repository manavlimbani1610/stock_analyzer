# Stock Prediction ML Backend

This backend provides ML-powered stock price predictions using trained models.

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Train Models (Optional)

Train models for popular stocks:

```bash
python train_model.py
```

This will create `.pkl` model files in the `models/` directory for:
- AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA

### 3. Start the API Server

```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and loaded models.

### Get Prediction
```
GET /api/predict/{ticker}?days=30
```
Returns 30-day price prediction for the specified stock.

**Response:**
```json
{
  "ticker": "AAPL",
  "predictions": [
    {
      "day": 1,
      "date": "2024-01-15",
      "predictedClose": 185.50,
      "confidence": 0.95
    }
  ],
  "metrics": {
    "rmse": 2.5,
    "lastPrice": 183.25,
    "trend": "bullish",
    "trendPercent": 1.23,
    "volatility": 25.5,
    "modelType": "linear_regression"
  },
  "historicalData": [...]
}
```

### List Models
```
GET /api/models
```
Returns list of pre-trained and cached models.

### Train Model
```
POST /api/train/{ticker}
```
Trains and saves a new model for the specified ticker.

## Model Details

The prediction system uses:
- **Linear Regression** (default): Fast, works for any ticker
- **LSTM Neural Network** (optional): Better accuracy, requires TensorFlow

Models are trained on historical stock data fetched from Yahoo Finance.

## Environment Variables

Add to your React app's `.env`:
```
REACT_APP_ML_API_URL=http://localhost:5000
```

## Files

- `train_model.py` - Model training script
- `app.py` - Flask API server
- `requirements.txt` - Python dependencies
- `models/` - Saved model files (.pkl)
