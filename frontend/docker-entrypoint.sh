#!/bin/sh

# Docker entrypoint script for frontend
# Generates runtime environment config

# Create env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
    REACT_APP_API_URL: "${REACT_APP_API_URL:-http://localhost:8000}",
    REACT_APP_ML_API_URL: "${REACT_APP_ML_API_URL:-http://localhost:5001}",
    REACT_APP_ENVIRONMENT: "${REACT_APP_ENVIRONMENT:-production}",
    REACT_APP_FINNHUB_API_KEY: "${REACT_APP_FINNHUB_API_KEY:-}",
    REACT_APP_DEBUG: "${REACT_APP_DEBUG:-false}"
};
EOF

echo "Environment config generated:"
cat /usr/share/nginx/html/env-config.js

# Execute the main command
exec "$@"
