# Stock Analyzer - Production System

A scalable, production-ready stock analysis and prediction platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NGINX (Port 80)                            │
│                         (Reverse Proxy / Static Files)                  │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
┌─────────────────────────────┐    ┌─────────────────────────────────────┐
│      Frontend (Port 3000)   │    │         Backend API (Port 8000)     │
│         React + MUI         │    │             FastAPI                 │
│    ┌─────────────────────┐  │    │    ┌─────────────────────────────┐  │
│    │  Components/Pages   │  │    │    │      API Gateway            │  │
│    │  Context Providers  │◄─┼────┼───►│   /api/v1/stocks/*          │  │
│    │  Services/Utils     │  │    │    │   /api/v1/predictions/*     │  │
│    └─────────────────────┘  │    │    └─────────────────────────────┘  │
└─────────────────────────────┘    └─────────────────────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │       ML Service (Port 5001)            │
                               │             Flask                       │
                               │    ┌─────────────────────────────────┐  │
                               │    │     Prediction Engine           │  │
                               │    │   - Linear Regression           │  │
                               │    │   - Model Caching               │  │
                               │    │   - On-demand Training          │  │
                               │    └─────────────────────────────────┘  │
                               └─────────────────────────────────────────┘
```

## Project Structure

```
production/
├── backend/                 # FastAPI Backend Service
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   ├── core/           # Core utilities
│   │   └── schemas/        # Pydantic models
│   ├── Dockerfile
│   └── requirements.txt
│
├── ml-service/             # ML Prediction Service
│   ├── app/                # Flask application
│   ├── trained_models/     # Saved models (*.pkl)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   ├── Dockerfile
│   └── nginx.conf
│
├── shared/                 # Shared utilities
├── scripts/                # Automation scripts
├── tests/                  # Test suites
├── docs/                   # Documentation
│
├── docker-compose.yml      # Service orchestration
├── .env.example            # Environment template
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### 1. Setup

```bash
cd production
cp .env.example .env
# Edit .env with your API keys (FINNHUB_API_KEY)
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application

| Service     | URL                        |
|-------------|----------------------------|
| Frontend    | http://localhost:3000      |
| Backend API | http://localhost:8000      |
| ML Service  | http://localhost:5001      |
| API Docs    | http://localhost:8000/docs |

## API Endpoints

### Backend API (Port 8000)

| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| GET    | /health                              | Health check         |
| GET    | /ready                               | Readiness check      |
| GET    | /api/v1/stocks/quote/{ticker}        | Get stock quote      |
| GET    | /api/v1/stocks/profile/{ticker}      | Get company profile  |
| GET    | /api/v1/stocks/search?q=             | Search stocks        |
| GET    | /api/v1/predictions/predict/{ticker} | Get predictions      |
| GET    | /api/v1/predictions/models           | List models          |
| POST   | /api/v1/predictions/train/{ticker}   | Train new model      |

### ML Service (Port 5001)

| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| GET    | /health               | Health check     |
| GET    | /api/predict/{ticker} | Get predictions  |
| GET    | /api/models           | List models      |
| POST   | /api/train/{ticker}   | Train model      |

## Configuration

### Environment Variables

```bash
# Application
ENVIRONMENT=production
DEBUG=false

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
ML_SERVICE_PORT=5001

# External APIs (Required)
FINNHUB_API_KEY=your_key_here

# Optional
ALPHA_VANTAGE_API_KEY=your_key_here
REDIS_HOST=redis
REDIS_PORT=6379
```

## Development

### Local Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Local ML Service

```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

### Local Frontend

```bash
cd frontend
npm install
npm start
```

## Health Checks

```bash
curl http://localhost:8000/health
curl http://localhost:5001/health
curl http://localhost:3000/health
```

## Architecture Decisions

1. **Microservices**: Loosely coupled, independently deployable
2. **API Gateway**: Backend proxies ML requests
3. **Stateless**: All services stateless for horizontal scaling
4. **12-Factor**: Config via environment variables
5. **Health Checks**: Docker health checks for availability

## Scaling

```bash
# Scale ML service
docker-compose up -d --scale ml-service=3

# Scale backend
docker-compose up -d --scale backend=2
```

## Troubleshooting

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs backend
docker-compose logs ml-service
```

## License

MIT License
