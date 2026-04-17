#!/bin/bash
# Stock Analyzer - Stop Services

cd "$(dirname "$0")/.."

echo "Stopping Stock Analyzer services..."
docker-compose down

if [ "$1" == "--clean" ]; then
    echo "Removing volumes..."
    docker-compose down -v
fi

echo "Services stopped."
