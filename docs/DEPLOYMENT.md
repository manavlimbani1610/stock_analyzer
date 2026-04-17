# Deployment Guide

## Deployment Options

### 1. Docker Compose (Recommended for Single Server)

```bash
# Production deployment
cd production
cp .env.example .env
# Configure .env with production values

docker-compose up -d --build
```

### 2. Kubernetes (For Scale)

Helm charts are available in `infra/k8s/` (coming soon).

### 3. Cloud Platforms

#### AWS ECS

1. Push images to ECR
2. Create ECS cluster
3. Deploy with provided task definitions

#### Google Cloud Run

1. Push images to GCR
2. Deploy each service to Cloud Run
3. Configure service-to-service communication

## Pre-Deployment Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Configure API keys (FINNHUB_API_KEY)
- [ ] Set secure CORS origins
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring/alerting
- [ ] Configure log aggregation
- [ ] Set up backup strategy for ML models

## Environment Configuration

### Required Variables

```bash
ENVIRONMENT=production
DEBUG=false
FINNHUB_API_KEY=your_production_key
CORS_ORIGINS=https://yourdomain.com
```

### Optional Variables

```bash
LOG_LEVEL=INFO
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
REDIS_HOST=redis
REDIS_PORT=6379
```

## SSL/TLS Configuration

For production, use a reverse proxy (Nginx/Traefik) with SSL:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api/ {
        proxy_pass http://backend:8000/;
    }
}
```

## Monitoring

### Health Checks

```bash
# Automated health check script
./scripts/health-check.sh
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
```

### Metrics (Future)

Prometheus metrics endpoint planned for `/metrics`.

## Scaling

### Horizontal Scaling

```bash
# Scale backend
docker-compose up -d --scale backend=3

# Scale ML service
docker-compose up -d --scale ml-service=2
```

### Load Balancing

Use Nginx or Traefik as load balancer in front of scaled services.

## Backup & Recovery

### ML Models Backup

```bash
# Backup models volume
docker run --rm -v stock-analyzer-ml-models:/data -v $(pwd):/backup alpine tar czf /backup/models-backup.tar.gz /data

# Restore models
docker run --rm -v stock-analyzer-ml-models:/data -v $(pwd):/backup alpine tar xzf /backup/models-backup.tar.gz -C /
```

## Rollback Procedure

```bash
# Tag current working version before deploy
docker tag stock-analyzer-backend:latest stock-analyzer-backend:rollback

# If issues, rollback
docker tag stock-analyzer-backend:rollback stock-analyzer-backend:latest
docker-compose up -d
```
