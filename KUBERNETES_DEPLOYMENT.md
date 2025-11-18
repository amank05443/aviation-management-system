# Kubernetes Deployment Guide

This guide explains how to deploy the Aviation application on Kubernetes.

## Prerequisites

- Kubernetes cluster (minikube, Docker Desktop, or cloud provider)
- kubectl CLI tool installed and configured
- Docker images built and available

## Kubernetes Resources

The `k8s/` directory contains all Kubernetes manifests:

```
k8s/
├── namespace.yaml              # Aviation namespace
├── configmap.yaml              # Application configuration
├── secret.yaml                 # Sensitive data (passwords, keys)
├── postgres-pvc.yaml           # PostgreSQL persistent storage
├── postgres-deployment.yaml    # PostgreSQL deployment
├── postgres-service.yaml       # PostgreSQL service
├── backend-deployment.yaml     # Django backend deployment
├── backend-service.yaml        # Backend service
├── frontend-deployment.yaml    # React frontend deployment
└── frontend-service.yaml       # Frontend LoadBalancer service
```

## Quick Start

### 1. Build Docker Images

First, build your Docker images:

```bash
# Build frontend image
cd frontend
docker build -t aviation-frontend:latest .
cd ..

# Build backend image
cd backend
docker build -t aviation-backend:latest .
cd ..
```

### 2. Load Images (for Minikube/Docker Desktop)

If using Minikube:

```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild images in Minikube
docker build -t aviation-frontend:latest ./frontend
docker build -t aviation-backend:latest ./backend
```

If using Docker Desktop Kubernetes, images are already available.

### 3. Update Secrets

Edit `k8s/secret.yaml` and update with secure values:

```bash
# Generate a secure Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Update the secret.yaml file with your values
```

### 4. Deploy to Kubernetes

Deploy all resources in order:

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n aviation --timeout=120s

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n aviation --timeout=120s

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

Or deploy everything at once:

```bash
kubectl apply -f k8s/
```

### 5. Access the Application

#### For Minikube:

```bash
# Get the frontend URL
minikube service frontend-service -n aviation --url

# Or use port forwarding
kubectl port-forward -n aviation service/frontend-service 8080:80
# Access at http://localhost:8080
```

#### For Docker Desktop:

```bash
# Frontend will be available at http://localhost
kubectl get svc -n aviation frontend-service
```

#### For Cloud Providers:

```bash
# Get the external IP
kubectl get svc -n aviation frontend-service
# Wait for EXTERNAL-IP to be assigned
```

## Management Commands

### View All Resources

```bash
kubectl get all -n aviation
```

### View Logs

```bash
# Backend logs
kubectl logs -n aviation -l app=backend -f

# Frontend logs
kubectl logs -n aviation -l app=frontend -f

# PostgreSQL logs
kubectl logs -n aviation -l app=postgres -f
```

### Execute Commands in Pods

```bash
# Run Django migrations
kubectl exec -n aviation deployment/backend -- python manage.py migrate

# Create superuser (interactive)
kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser

# Collect static files
kubectl exec -n aviation deployment/backend -- python manage.py collectstatic --noinput

# Access PostgreSQL shell
kubectl exec -it -n aviation deployment/postgres -- psql -U aviation_user -d aviation_db
```

### Scale Deployments

```bash
# Scale backend
kubectl scale deployment/backend -n aviation --replicas=3

# Scale frontend
kubectl scale deployment/frontend -n aviation --replicas=3
```

### Update Deployments

```bash
# After building new images
kubectl rollout restart deployment/backend -n aviation
kubectl rollout restart deployment/frontend -n aviation

# Check rollout status
kubectl rollout status deployment/backend -n aviation
```

## Configuration Updates

### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap aviation-config -n aviation

# Or apply changes from file
kubectl apply -f k8s/configmap.yaml

# Restart deployments to pick up changes
kubectl rollout restart deployment/backend -n aviation
```

### Update Secrets

```bash
# Edit secret
kubectl edit secret aviation-secrets -n aviation

# Or apply changes from file
kubectl apply -f k8s/secret.yaml

# Restart deployments
kubectl rollout restart deployment/backend -n aviation
```

## Database Management

### Backup Database

```bash
# Create backup
kubectl exec -n aviation deployment/postgres -- pg_dump -U aviation_user aviation_db > backup.sql
```

### Restore Database

```bash
# Restore from backup
kubectl exec -i -n aviation deployment/postgres -- psql -U aviation_user aviation_db < backup.sql
```

### Access Database

```bash
# Port forward to local machine
kubectl port-forward -n aviation service/postgres-service 5432:5432

# Connect using local PostgreSQL client
psql -h localhost -U aviation_user -d aviation_db
```

## Monitoring

### Pod Status

```bash
# Watch pod status
kubectl get pods -n aviation -w

# Describe pod for details
kubectl describe pod -n aviation <pod-name>
```

### Resource Usage

```bash
# View resource usage
kubectl top pods -n aviation
kubectl top nodes
```

### Events

```bash
# View events
kubectl get events -n aviation --sort-by='.lastTimestamp'
```

## Troubleshooting

### Backend Pods Not Starting

```bash
# Check logs
kubectl logs -n aviation -l app=backend

# Check if database is ready
kubectl get pods -n aviation -l app=postgres

# Verify environment variables
kubectl exec -n aviation deployment/backend -- env | grep DB_
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -n aviation deployment/backend -- nc -zv postgres-service 5432

# Check database pod
kubectl describe pod -n aviation -l app=postgres
```

### Frontend Can't Reach Backend

Check nginx configuration and ensure backend service is running:

```bash
kubectl get svc -n aviation backend-service
kubectl logs -n aviation -l app=frontend
```

## Cleanup

### Delete All Resources

```bash
# Delete all resources in namespace
kubectl delete namespace aviation

# Or delete individually
kubectl delete -f k8s/
```

### Delete Persistent Data

```bash
# Warning: This deletes all database data
kubectl delete pvc -n aviation postgres-pvc
```

## Production Considerations

### 1. Use Ingress Instead of LoadBalancer

Create an Ingress resource for better routing and SSL termination:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: aviation-ingress
  namespace: aviation
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: aviation-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### 2. Use External Database

For production, consider using managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

### 3. Use Private Registry

Push images to a private registry:

```bash
# Tag images
docker tag aviation-frontend:latest your-registry.com/aviation-frontend:latest
docker tag aviation-backend:latest your-registry.com/aviation-backend:latest

# Push to registry
docker push your-registry.com/aviation-frontend:latest
docker push your-registry.com/aviation-backend:latest

# Update deployments to use registry images
```

### 4. Set Resource Limits

Adjust resource requests and limits in deployment files based on your workload.

### 5. Enable Horizontal Pod Autoscaling

```bash
# Autoscale backend based on CPU
kubectl autoscale deployment backend -n aviation --cpu-percent=70 --min=2 --max=10

# Autoscale frontend
kubectl autoscale deployment frontend -n aviation --cpu-percent=70 --min=2 --max=5
```

### 6. Set up Monitoring

Use tools like Prometheus and Grafana for monitoring:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```
