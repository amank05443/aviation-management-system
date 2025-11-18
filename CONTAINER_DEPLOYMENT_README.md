# Aviation Application - Container Deployment

Complete guide for deploying the Aviation application using Docker and Kubernetes.

## Overview

The Aviation application consists of three main components:
- **Frontend**: React application served by Nginx
- **Backend**: Django REST API with Gunicorn
- **Database**: PostgreSQL 15

## Quick Start Options

### Option 1: Docker Compose (Recommended for Development)

The fastest way to get started:

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Option 2: Kubernetes (Recommended for Production)

For production deployment:

```bash
# Build Docker images
./build-docker.sh

# Deploy to Kubernetes
./deploy-k8s.sh

# Access based on your cluster type (instructions shown after deployment)
```

## File Structure

```
Aviation/
├── frontend/
│   ├── Dockerfile                 # Frontend container definition
│   ├── nginx.conf                 # Nginx configuration
│   └── .dockerignore             # Files to exclude from image
├── backend/
│   ├── Dockerfile                 # Backend container definition
│   ├── docker-entrypoint.sh      # Startup script
│   ├── requirements.txt          # Python dependencies
│   └── .dockerignore             # Files to exclude from image
├── k8s/
│   ├── namespace.yaml            # Kubernetes namespace
│   ├── configmap.yaml            # Configuration
│   ├── secret.yaml               # Secrets
│   ├── postgres-*.yaml           # Database resources
│   ├── backend-*.yaml            # Backend resources
│   └── frontend-*.yaml           # Frontend resources
├── docker-compose.yml            # Docker Compose configuration
├── build-docker.sh               # Build Docker images
├── deploy-k8s.sh                 # Deploy to Kubernetes
├── undeploy-k8s.sh               # Remove from Kubernetes
├── DOCKER_DEPLOYMENT.md          # Detailed Docker guide
└── KUBERNETES_DEPLOYMENT.md      # Detailed Kubernetes guide
```

## Prerequisites

### For Docker Compose:
- Docker Engine 20.10+
- Docker Compose 2.0+

### For Kubernetes:
- Kubernetes cluster (Minikube, Docker Desktop, or cloud)
- kubectl CLI configured
- Docker for building images

## Detailed Guides

### Docker Deployment
See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for:
- Building individual images
- Running containers manually
- Database management
- Production configuration
- Troubleshooting

### Kubernetes Deployment
See [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md) for:
- Cluster setup
- Resource configuration
- Scaling and monitoring
- Production best practices
- Advanced troubleshooting

## Common Commands

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Kubernetes

```bash
# Deploy application
./deploy-k8s.sh

# View status
kubectl get all -n aviation

# View logs
kubectl logs -n aviation -l app=backend -f

# Run migrations
kubectl exec -n aviation deployment/backend -- python manage.py migrate

# Scale backend
kubectl scale deployment/backend -n aviation --replicas=3

# Remove application
./undeploy-k8s.sh
```

## Environment Variables

Key environment variables for configuration:

### Backend
- `DEBUG`: Enable debug mode (True/False)
- `SECRET_KEY`: Django secret key
- `DB_ENGINE`: Database engine (django.db.backends.postgresql)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port (5432)
- `ALLOWED_HOSTS`: Comma-separated allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated CORS origins

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## Port Mapping

| Service    | Container Port | Host Port (Docker) | Service Type (K8s) |
|------------|----------------|--------------------|--------------------|
| Frontend   | 80             | 80                 | LoadBalancer       |
| Backend    | 8000           | 8000               | ClusterIP          |
| PostgreSQL | 5432           | 5432               | ClusterIP          |

## Production Checklist

Before deploying to production:

- [ ] Update `SECRET_KEY` in secrets
- [ ] Set `DEBUG=False`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set secure database password
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure resource limits
- [ ] Set up horizontal pod autoscaling (K8s)
- [ ] Use external managed database (recommended)
- [ ] Configure ingress with SSL (K8s)

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to git
   - Use environment variables or secret managers
   - Rotate secrets regularly

2. **Database**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups
   - Restrict network access

3. **Application**
   - Keep dependencies updated
   - Run security scans
   - Enable HTTPS only
   - Configure proper CORS

4. **Kubernetes**
   - Use NetworkPolicies
   - Enable RBAC
   - Use Pod Security Standards
   - Scan images for vulnerabilities

## Monitoring

### Docker Compose

```bash
# Resource usage
docker stats

# Health checks
docker-compose ps
```

### Kubernetes

```bash
# Resource usage
kubectl top pods -n aviation
kubectl top nodes

# Health status
kubectl get pods -n aviation
kubectl describe pod -n aviation <pod-name>
```

## Backup and Restore

### Database Backup

**Docker:**
```bash
docker-compose exec db pg_dump -U aviation_user aviation_db > backup.sql
```

**Kubernetes:**
```bash
kubectl exec -n aviation deployment/postgres -- pg_dump -U aviation_user aviation_db > backup.sql
```

### Database Restore

**Docker:**
```bash
docker-compose exec -T db psql -U aviation_user aviation_db < backup.sql
```

**Kubernetes:**
```bash
kubectl exec -i -n aviation deployment/postgres -- psql -U aviation_user aviation_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Backend can't connect to database**
   - Check database is running and healthy
   - Verify connection settings
   - Check network connectivity

2. **Frontend shows connection error**
   - Verify backend is running
   - Check API URL configuration
   - Check CORS settings

3. **Migrations fail**
   - Ensure database is ready
   - Check database credentials
   - Verify network connectivity

4. **Pods crash in Kubernetes**
   - Check logs: `kubectl logs -n aviation <pod-name>`
   - Verify resource limits
   - Check image pull policy

### Getting Help

For detailed troubleshooting:
- Docker: See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- Kubernetes: See [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md)

## Maintenance

### Updating Application

**Docker Compose:**
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

**Kubernetes:**
```bash
# Build new images
./build-docker.sh

# Rolling update
kubectl rollout restart deployment/backend -n aviation
kubectl rollout restart deployment/frontend -n aviation
```

### Cleaning Up

**Docker:**
```bash
# Remove containers and volumes
docker-compose down -v

# Clean up images
docker image prune -a
```

**Kubernetes:**
```bash
# Remove application
./undeploy-k8s.sh
```

## Performance Tuning

### Docker Compose
- Adjust Gunicorn workers in `docker-compose.yml`
- Configure PostgreSQL settings
- Optimize Nginx caching

### Kubernetes
- Set appropriate resource requests/limits
- Configure horizontal pod autoscaling
- Use node affinity for optimal placement
- Enable cluster autoscaling

## Next Steps

1. **Development**: Use Docker Compose for local development
2. **Staging**: Deploy to Kubernetes cluster for testing
3. **Production**: Follow production checklist and deploy to production cluster
4. **Monitor**: Set up monitoring and alerting
5. **Optimize**: Tune performance based on metrics

## Support

For issues or questions:
- Check the detailed guides in DOCKER_DEPLOYMENT.md and KUBERNETES_DEPLOYMENT.md
- Review logs for error messages
- Verify all prerequisites are met
- Check environment variable configuration
