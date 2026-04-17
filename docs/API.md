# API Documentation

## Overview

The Stock Analyzer API provides endpoints for stock data retrieval and ML-based price predictions.

## Base URLs

- **Backend API**: `http://localhost:8000`
- **ML Service**: `http://localhost:5001`

## Authentication

Currently, the API does not require authentication. For production deployments, implement JWT or API key authentication.

## Rate Limiting

- Default: 100 requests per minute per IP
- Configurable via `RATE_LIMIT_REQUESTS` environment variable

## Endpoints

### Health & Status

#### GET /health
Returns service health status.

**Response:**
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "backend": "running",
    "ml_service": "http://ml-service:5001"
  }
}
```

#### GET /ready
Returns readiness status including dependency checks.

**Response:**
```json
{
  "status": "ready",
  "checks": {
    "backend": true,
    "ml_service": true
  }
}
```

### Stocks API

#### GET /api/v1/stocks/quote/{ticker}
Get real-time stock quote.

**Parameters:**
- `ticker` (path): Stock symbol (e.g., AAPL, MSFT)

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 178.50,
  "change": 2.35,
  "changePercent": 1.33,
  "high": 179.20,
  "low": 176.80,
  "open": 177.00,
  "previousClose": 176.15,
  "timestamp": "2024-01-15T16:00:00Z"
}
```

#### GET /api/v1/stocks/profile/{ticker}
Get company profile information.

**Response:**
```json
{
  "name": "Apple Inc.",
  "ticker": "AAPL",
  "industry": "Technology",
  "sector": "Technology",
  "marketCap": 2800000000000,
  "exchange": "NASDAQ",
  "logo": "https://...",
  "weburl": "https://apple.com"
}
```

#### GET /api/v1/stocks/search
Search for stocks by symbol or name.

**Parameters:**
- `q` (query): Search query string

**Response:**
```json
{
  "query": "apple",
  "count": 5,
  "results": [
    {"symbol": "AAPL", "description": "Apple Inc."},
    {"symbol": "APLE", "description": "Apple Hospitality REIT"}
  ]
}
```

### Predictions API

#### GET /api/v1/predictions/predict/{ticker}
Get ML-based price predictions.

**Parameters:**
- `ticker` (path): Stock symbol
- `days` (query, optional): Number of days to predict (1-90, default: 30)

**Response:**
```json
{
  "ticker": "AAPL",
  "predictions": [
    {
      "day": 1,
      "date": "2024-01-16",
      "predictedClose": 179.25,
      "confidence": 0.95
    }
  ],
  "metrics": {
    "rmse": 0.023,
    "lastPrice": 178.50,
    "trend": "bullish",
    "trendPercent": 2.5,
    "volatility": 18.5,
    "modelType": "linear_regression"
  },
  "historicalData": [
    {
      "date": "2024-01-15",
      "close": 178.50,
      "open": 177.00,
      "high": 179.20,
      "low": 176.80,
      "volume": 45000000
    }
  ]
}
```

#### GET /api/v1/predictions/models
List available prediction models.

**Response:**
```json
{
  "pretrained_models": ["AAPL", "MSFT", "GOOGL"],
  "cached_models": ["AAPL", "TSLA"]
}
```

#### POST /api/v1/predictions/train/{ticker}
Train a new prediction model for a ticker.

**Response:**
```json
{
  "message": "Model trained and saved for AAPL",
  "metrics": {
    "rmse": 0.023
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid parameters |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error |
| 503  | Service Unavailable |

## WebSocket (Future)

WebSocket support for real-time updates is planned for v2.0.
