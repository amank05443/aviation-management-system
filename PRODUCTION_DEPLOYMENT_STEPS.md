# Production Deployment Steps for Docker Desktop Kubernetes

## Prerequisites Setup

### Step 1: Install Docker Desktop

1. Download Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Wait for Docker to fully start (you'll see the whale icon in the menu bar)

### Step 2: Enable Kubernetes in Docker Desktop

1. Click the Docker icon in the menu bar
2. Select "Preferences" (or "Settings")
3. Go to the "Kubernetes" tab
4. Check "Enable Kubernetes"
5. Click "Apply & Restart"
6. Wait for Kubernetes to start (status should show "Kubernetes is running")

### Step 3: Verify Installation

Open a terminal and run:

```bash
# Check Docker
docker --version

# Check kubectl
kubectl version --client

# Check cluster
kubectl cluster-info

# Check nodes
kubectl get nodes
```

You should see your Docker Desktop node in a "Ready" state.

## Deployment Process

### Step 1: Build Docker Images

Build the frontend and backend images:

```bash
# Navigate to project directory
cd /Users/aman/Documents/Aviation

# Build frontend image
cd frontend
docker build -t aviation-frontend:latest .
cd ..

# Build backend image
cd backend
docker build -t aviation-backend:latest .
cd ..

# Verify images are built
docker images | grep aviation
```

Expected output:
```
aviation-backend     latest    ...    ...    ...
aviation-frontend    latest    ...    ...    ...
```

### Step 2: Update Production Secrets

**IMPORTANT**: Update the secrets before deploying!

Edit `k8s/secret.yaml`:

```bash
# Generate a secure Django secret key
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Open the secret file
open k8s/secret.yaml
```

Update these values in `k8s/secret.yaml`:
- `SECRET_KEY`: Use the generated key above
- `DB_PASSWORD`: Use a strong password (e.g., generate with: `openssl rand -base64 32`)

### Step 3: Update Production Configuration

Edit `k8s/configmap.yaml`:

```bash
open k8s/configmap.yaml
```

Update:
- `DEBUG`: Change to `"False"` for production
- `ALLOWED_HOSTS`: Update with your actual domain or keep `localhost,127.0.0.1`
- `CORS_ALLOWED_ORIGINS`: Update with your frontend URL

### Step 4: Deploy to Kubernetes

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

# Wait for PostgreSQL to be ready (this may take 1-2 minutes)
kubectl wait --for=condition=ready pod -l app=postgres -n aviation --timeout=180s

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Wait for backend to be ready (this may take 2-3 minutes)
kubectl wait --for=condition=ready pod -l app=backend -n aviation --timeout=300s

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Step 5: Verify Deployment

Check that all pods are running:

```bash
# View all resources
kubectl get all -n aviation

# Check pod status (all should be Running)
kubectl get pods -n aviation

# Check services
kubectl get svc -n aviation
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-xxx                 1/1     Running   0          2m
pod/backend-yyy                 1/1     Running   0          2m
pod/frontend-xxx                1/1     Running   0          1m
pod/frontend-yyy                1/1     Running   0          1m
pod/postgres-xxx                1/1     Running   0          3m
```

### Step 6: Run Database Migrations

Initialize the database:

```bash
# Run migrations
kubectl exec -n aviation deployment/backend -- python manage.py migrate

# Check migration status
kubectl exec -n aviation deployment/backend -- python manage.py showmigrations
```

### Step 7: Create Django Superuser

Create an admin user:

```bash
# Interactive superuser creation
kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser
```

Follow the prompts:
- Username: (your choice, e.g., `admin`)
- Email: (your email)
- Password: (strong password)
- Password (again): (confirm)

### Step 8: Access the Application

For Docker Desktop, the LoadBalancer service will be available on localhost:

```bash
# Check the frontend service
kubectl get svc -n aviation frontend-service

# The application should be available at:
# http://localhost (port 80)
```

Open your browser and navigate to:
- **Frontend**: http://localhost
- **Backend Admin**: http://localhost/admin

### Step 9: View Logs (if needed)

If something isn't working, check the logs:

```bash
# Backend logs
kubectl logs -n aviation -l app=backend -f

# Frontend logs
kubectl logs -n aviation -l app=frontend -f

# PostgreSQL logs
kubectl logs -n aviation -l app=postgres -f

# Describe pods for more details
kubectl describe pod -n aviation -l app=backend
```

## Post-Deployment Tasks

### Load Initial Data (Optional)

If you have fixtures or initial data:

```bash
# Load fixtures
kubectl exec -n aviation deployment/backend -- python manage.py loaddata your_fixture.json
```

### Scaling the Application

Scale up for better performance:

```bash
# Scale backend to 3 replicas
kubectl scale deployment/backend -n aviation --replicas=3

# Scale frontend to 3 replicas
kubectl scale deployment/frontend -n aviation --replicas=3

# Verify scaling
kubectl get pods -n aviation
```

### Monitoring

Monitor resource usage:

```bash
# Enable metrics server (if not already enabled)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# View resource usage
kubectl top pods -n aviation
kubectl top nodes
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod -n aviation <pod-name>

# Check logs
kubectl logs -n aviation <pod-name>

# Check if image is available
docker images | grep aviation
```

### Database Connection Issues

```bash
# Check if postgres pod is running
kubectl get pods -n aviation -l app=postgres

# Test connection from backend
kubectl exec -n aviation deployment/backend -- nc -zv postgres-service 5432

# Check postgres logs
kubectl logs -n aviation -l app=postgres
```

### Frontend Can't Reach Backend

```bash
# Check backend service
kubectl get svc -n aviation backend-service

# Check backend pods
kubectl get pods -n aviation -l app=backend

# Check frontend nginx configuration
kubectl exec -n aviation deployment/frontend -- cat /etc/nginx/conf.d/default.conf
```

### Port Already in Use

If port 80 is already in use:

Edit `k8s/frontend-service.yaml` and change:
```yaml
ports:
- port: 8080        # Changed from 80
  targetPort: 80
```

Then access at http://localhost:8080

### Image Pull Issues

If pods can't find images:

```bash
# Verify images exist
docker images | grep aviation

# Check pod events
kubectl describe pod -n aviation <pod-name>
```

## Updating the Application

When you make code changes:

```bash
# Rebuild images
cd frontend
docker build -t aviation-frontend:latest .
cd ../backend
docker build -t aviation-backend:latest .
cd ..

# Rolling restart
kubectl rollout restart deployment/backend -n aviation
kubectl rollout restart deployment/frontend -n aviation

# Watch the rollout
kubectl rollout status deployment/backend -n aviation
kubectl rollout status deployment/frontend -n aviation
```

## Backup and Restore

### Backup Database

```bash
# Create backup
kubectl exec -n aviation deployment/postgres -- pg_dump -U aviation_user aviation_db > aviation_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
kubectl exec -i -n aviation deployment/postgres -- psql -U aviation_user aviation_db < aviation_backup_20241116_120000.sql
```

## Cleanup

To remove everything:

```bash
# Delete all resources
kubectl delete namespace aviation

# Or use the script
./undeploy-k8s.sh
```

## Production Checklist

- [ ] Updated SECRET_KEY with secure random value
- [ ] Changed DB_PASSWORD to strong password
- [ ] Set DEBUG=False in ConfigMap
- [ ] Updated ALLOWED_HOSTS with actual domain
- [ ] Updated CORS_ALLOWED_ORIGINS
- [ ] Created Django superuser
- [ ] Tested all API endpoints
- [ ] Verified database backups work
- [ ] Set up monitoring (optional)
- [ ] Documented admin credentials securely
- [ ] Tested application functionality

## Next Steps

1. **SSL/TLS**: For production, set up an Ingress with SSL certificates
2. **Domain**: Configure a proper domain name
3. **Monitoring**: Set up Prometheus and Grafana
4. **Backups**: Automate database backups
5. **CI/CD**: Set up automated deployments

## Quick Reference Commands

```bash
# View all resources
kubectl get all -n aviation

# View logs
kubectl logs -n aviation -l app=backend -f

# Execute commands
kubectl exec -n aviation deployment/backend -- python manage.py <command>

# Scale
kubectl scale deployment/backend -n aviation --replicas=3

# Update
kubectl rollout restart deployment/backend -n aviation

# Delete
kubectl delete namespace aviation
```

## Support

If you encounter issues:
1. Check the logs: `kubectl logs -n aviation -l app=backend`
2. Check pod status: `kubectl get pods -n aviation`
3. Describe problematic pods: `kubectl describe pod -n aviation <pod-name>`
4. Review the events: `kubectl get events -n aviation --sort-by='.lastTimestamp'`
