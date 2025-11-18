# Aviation Application - Kubernetes Production Deployment Summary

## 🎯 What's Been Created

Your Aviation application is now fully containerized and ready for Kubernetes deployment!

### Docker Configuration ✅
- **Frontend**: React app with Nginx (multi-stage build)
- **Backend**: Django with Gunicorn and PostgreSQL support
- **Database**: PostgreSQL 15-alpine

### Kubernetes Manifests ✅
All manifests are in the `k8s/` directory:
- Namespace, ConfigMap, and Secrets
- PostgreSQL with persistent storage
- Backend deployment (2 replicas)
- Frontend deployment (2 replicas)
- All necessary services

### Helper Scripts ✅
- `build-docker.sh` - Build all images
- `deploy-production.sh` - **Automated production deployment** ⭐
- `undeploy-k8s.sh` - Clean removal
- `deploy-k8s.sh` - Manual deployment (alternative)

### Documentation ✅
- `PRODUCTION_DEPLOYMENT_STEPS.md` - Complete step-by-step guide
- `DOCKER_DEPLOYMENT.md` - Docker details
- `KUBERNETES_DEPLOYMENT.md` - K8s details
- `CONTAINER_DEPLOYMENT_README.md` - Quick reference

## 🚀 Quick Start - Production Deployment

### Prerequisites (One-time setup)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start it

2. **Enable Kubernetes**
   - Docker Desktop → Preferences → Kubernetes
   - Check "Enable Kubernetes"
   - Apply & Restart

3. **Verify Setup**
   ```bash
   docker --version
   kubectl version --client
   kubectl get nodes
   ```

### Deploy in 3 Simple Steps

#### Step 1: Update Production Configuration (IMPORTANT!)

Before deploying, update these files:

**`k8s/secret.yaml`** - Update with secure values:
```bash
# Generate secure SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Generate secure DB_PASSWORD
openssl rand -base64 32

# Edit the file and replace the values
```

**`k8s/configmap.yaml`** - Update:
- Change `DEBUG: "True"` to `DEBUG: "False"`
- Update `ALLOWED_HOSTS` if needed
- Update `CORS_ALLOWED_ORIGINS` if needed

#### Step 2: Run the Deployment Script

```bash
cd /Users/aman/Documents/Aviation
./deploy-production.sh
```

This script will:
1. ✅ Check all prerequisites
2. ✅ Build Docker images
3. ✅ Deploy to Kubernetes
4. ✅ Run database migrations
5. ✅ Show deployment status

#### Step 3: Create Admin User & Access

```bash
# Create superuser
kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser

# Access your application
# Frontend: http://localhost
# Admin: http://localhost/admin
```

## 📋 Common Operations

### View Application Status
```bash
kubectl get all -n aviation
kubectl get pods -n aviation -w
```

### View Logs
```bash
# Backend logs
kubectl logs -n aviation -l app=backend -f

# Frontend logs
kubectl logs -n aviation -l app=frontend -f

# All logs
kubectl logs -n aviation -l app=backend -f & kubectl logs -n aviation -l app=frontend -f
```

### Scale Application
```bash
# Scale backend to 3 replicas
kubectl scale deployment/backend -n aviation --replicas=3

# Scale frontend to 3 replicas
kubectl scale deployment/frontend -n aviation --replicas=3
```

### Run Django Commands
```bash
# Migrations
kubectl exec -n aviation deployment/backend -- python manage.py migrate

# Create superuser (interactive)
kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser

# Collect static files
kubectl exec -n aviation deployment/backend -- python manage.py collectstatic --noinput

# Django shell
kubectl exec -it -n aviation deployment/backend -- python manage.py shell
```

### Update Application After Code Changes
```bash
# Rebuild images
cd frontend && docker build -t aviation-frontend:latest . && cd ..
cd backend && docker build -t aviation-backend:latest . && cd ..

# Rolling restart
kubectl rollout restart deployment/backend -n aviation
kubectl rollout restart deployment/frontend -n aviation

# Watch rollout progress
kubectl rollout status deployment/backend -n aviation
```

### Database Operations
```bash
# Backup database
kubectl exec -n aviation deployment/postgres -- pg_dump -U aviation_user aviation_db > backup_$(date +%Y%m%d).sql

# Restore database
kubectl exec -i -n aviation deployment/postgres -- psql -U aviation_user aviation_db < backup.sql

# Access PostgreSQL shell
kubectl exec -it -n aviation deployment/postgres -- psql -U aviation_user -d aviation_db

# Port forward for local access
kubectl port-forward -n aviation service/postgres-service 5432:5432
```

## 🔧 Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n aviation

# Describe pod for details
kubectl describe pod -n aviation <pod-name>

# Check logs
kubectl logs -n aviation <pod-name>
```

### Backend Can't Connect to Database
```bash
# Check if postgres is running
kubectl get pods -n aviation -l app=postgres

# View postgres logs
kubectl logs -n aviation -l app=postgres

# Check connection from backend
kubectl exec -n aviation deployment/backend -- python -c "import psycopg2; print('OK')"
```

### Images Not Found
```bash
# Verify images exist
docker images | grep aviation

# If missing, rebuild
cd frontend && docker build -t aviation-frontend:latest . && cd ..
cd backend && docker build -t aviation-backend:latest . && cd ..

# Restart deployments
kubectl rollout restart deployment/backend -n aviation
kubectl rollout restart deployment/frontend -n aviation
```

### Port 80 Already in Use
Edit `k8s/frontend-service.yaml`:
```yaml
ports:
- port: 8080  # Change from 80
  targetPort: 80
```
Then: `kubectl apply -f k8s/frontend-service.yaml`
Access at: http://localhost:8080

### View All Events
```bash
kubectl get events -n aviation --sort-by='.lastTimestamp'
```

## 🧹 Cleanup

### Remove Application (Keep Data)
```bash
kubectl delete deployment,service -n aviation --all
```

### Complete Removal (Including Data)
```bash
./undeploy-k8s.sh
# or
kubectl delete namespace aviation
```

## 📊 Monitoring

### Resource Usage
```bash
# Pod resource usage
kubectl top pods -n aviation

# Node resource usage
kubectl top nodes

# Watch resource usage
watch kubectl top pods -n aviation
```

### Health Checks
```bash
# Check all pods
kubectl get pods -n aviation

# Check services
kubectl get svc -n aviation

# Check endpoints
kubectl get endpoints -n aviation
```

## 🔐 Security Checklist

Before going to production:

- [ ] Updated `SECRET_KEY` in `k8s/secret.yaml`
- [ ] Changed `DB_PASSWORD` to strong password
- [ ] Set `DEBUG=False` in `k8s/configmap.yaml`
- [ ] Updated `ALLOWED_HOSTS` with actual domain
- [ ] Updated `CORS_ALLOWED_ORIGINS` appropriately
- [ ] Created Django superuser with strong password
- [ ] Removed or secured default admin accounts
- [ ] Reviewed and limited service permissions
- [ ] Set up regular database backups
- [ ] Tested backup and restore procedures
- [ ] Configured SSL/TLS (if using domain)
- [ ] Set up monitoring and alerting

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Namespace: aviation                    │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐         │
│  │   Frontend   │      │   Backend    │         │
│  │   (Nginx)    │──────│   (Django)   │         │
│  │  2 Replicas  │      │  2 Replicas  │         │
│  └──────────────┘      └──────────────┘         │
│         │                      │                 │
│         │                      │                 │
│    LoadBalancer            ClusterIP            │
│      (port 80)            (port 8000)           │
│                                 │                │
│                          ┌──────────────┐        │
│                          │  PostgreSQL  │        │
│                          │  (1 Replica) │        │
│                          └──────────────┘        │
│                                 │                │
│                          PersistentVolume        │
│                              (5Gi)               │
└─────────────────────────────────────────────────┘
```

## 📁 File Structure Reference

```
Aviation/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── requirements.txt
│   └── .dockerignore
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
├── docker-compose.yml
├── deploy-production.sh ⭐
├── build-docker.sh
├── deploy-k8s.sh
├── undeploy-k8s.sh
├── PRODUCTION_DEPLOYMENT_STEPS.md
├── DOCKER_DEPLOYMENT.md
├── KUBERNETES_DEPLOYMENT.md
└── CONTAINER_DEPLOYMENT_README.md
```

## 🎓 Learning Resources

- **Kubernetes Basics**: https://kubernetes.io/docs/tutorials/kubernetes-basics/
- **Docker Desktop**: https://docs.docker.com/desktop/
- **kubectl Commands**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/

## 💡 Tips

1. **Use the automated script**: `./deploy-production.sh` handles everything
2. **Check logs early**: If something fails, logs are your friend
3. **Scale gradually**: Start with 2 replicas, scale based on load
4. **Backup regularly**: Set up automated database backups
5. **Monitor resources**: Use `kubectl top` to watch resource usage
6. **Update secrets**: Always use strong, unique passwords
7. **Test locally first**: Use Docker Compose before K8s

## 🚀 Next Steps

1. **Deploy**: Run `./deploy-production.sh`
2. **Test**: Access http://localhost and verify everything works
3. **Monitor**: Check logs and resource usage
4. **Scale**: Increase replicas as needed
5. **Secure**: Follow the security checklist
6. **Backup**: Set up regular database backups
7. **Document**: Keep track of any custom configurations

## 📞 Getting Help

If you run into issues:

1. **Check logs**: `kubectl logs -n aviation -l app=backend -f`
2. **Check status**: `kubectl get pods -n aviation`
3. **Describe pods**: `kubectl describe pod -n aviation <pod-name>`
4. **View events**: `kubectl get events -n aviation --sort-by='.lastTimestamp'`
5. **Review docs**: Check PRODUCTION_DEPLOYMENT_STEPS.md

---

**Ready to deploy?** Run: `./deploy-production.sh`

Good luck with your deployment! 🚀
