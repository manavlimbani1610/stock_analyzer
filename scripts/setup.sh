#!/bin/bash
# Stock Analyzer - Development Setup Script

set -e

echo "=========================================="
echo "Stock Analyzer - Development Setup"
echo "=========================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    exit 1
fi

echo "[OK] Docker and Docker Compose found"

# Create .env file if not exists
if [ ! -f ../.env ]; then
    echo "[INFO] Creating .env file from template..."
    cp ../.env.example ../.env
    echo "[WARN] Please edit .env file with your API keys"
fi

# Create necessary directories
echo "[INFO] Creating directories..."
mkdir -p ../ml-service/trained_models
mkdir -p ../logs

# Build and start services
echo "[INFO] Building Docker images..."
cd ..
docker-compose build

echo "=========================================="
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "  cd production && docker-compose up"
echo ""
echo "Services will be available at:"
echo "  Frontend:   http://localhost:3000"
echo "  Backend:    http://localhost:8000"
echo "  ML Service: http://localhost:5001"
echo "=========================================="
