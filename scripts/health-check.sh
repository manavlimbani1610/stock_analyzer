#!/bin/bash
# Stock Analyzer - Health Check Script

echo "Checking service health..."
echo ""

check_service() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "[OK] $name is healthy"
        return 0
    else
        echo "[FAIL] $name is not responding"
        return 1
    fi
}

check_service "Frontend" "http://localhost:3000/health"
check_service "Backend" "http://localhost:8000/health"
check_service "ML Service" "http://localhost:5001/health"

echo ""
echo "Health check complete."
