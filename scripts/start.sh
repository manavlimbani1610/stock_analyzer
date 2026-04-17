#!/bin/bash
# Stock Analyzer - Start Services

set -e

cd "$(dirname "$0")/.."

echo "Starting Stock Analyzer services..."

if [ "$1" == "--build" ]; then
    docker-compose up --build -d
else
    docker-compose up -d
fi

echo ""
echo "Services starting..."
echo "  Frontend:   http://localhost:3000"
echo "  Backend:    http://localhost:8000"
echo "  ML Service: http://localhost:5001"
echo ""
echo "View logs: docker-compose logs -f"
