# Quick Reference - Offline Deployment

## 🚀 One-Command Deployment

```bash
cd /Users/aman/Documents/Aviation
./deploy-offline.sh
```

This script does everything automatically!

---

## 📋 Manual Step-by-Step Commands

### Complete Deployment from Scratch

```bash
# 1. Navigate to project
cd /Users/aman/Documents/Aviation

# 2. Check Docker is running
docker --version

# 3. Verify base images
docker images | grep -E "(python|node|postgres|nginx)"

# 4. Build images (5-10 min)
docker-compose build

# 5. Start all services
docker-compose up -d

# 6. Check status
docker-compose ps

# 7. View logs
docker-compose logs -f

# 8. Create superuser
docker cp create_superuser.py aviation_backend:/app/
docker exec aviation_backend python /app/create_superuser.py
```

---

## 🔧 Essential Commands

### Start/Stop

```bash
# Stop all
docker-compose stop

# Start all
docker-compose start

# Restart all
docker-compose restart

# Stop and remove
docker-compose down
```

### View Logs

```bash
# All logs (live)
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Database only
docker-compose logs -f db

# Last 50 lines
docker-compose logs --tail=50
```

### Check Status

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# All running containers
docker ps
```

---

## 🔄 Rebuild Commands

### Rebuild Everything

```bash
# Stop and remove
docker-compose down

# Remove volumes (WARNING: deletes data!)
docker volume rm aviation_postgres_data aviation_static_volume aviation_media_volume

# Remove built images
docker rmi aviation-frontend aviation-backend

# Rebuild
docker-compose build

# Start
docker-compose up -d
```

### Rebuild Specific Service

```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost | - |
| **Admin Panel** | http://localhost:8000/admin/ | PNO: ADMIN001<br>Password: admin123 |
| **API** | http://localhost:8000/api/ | - |
| **Database** | localhost:5432 | User: aviation_user<br>Password: aviation_password |

---

## 🐛 Troubleshooting

### If base images are missing:

```bash
./load-docker-images.sh
```

### If port is already in use:

```bash
# Find process using port
lsof -i :80
lsof -i :8000

# Stop it or change docker-compose.yml ports
```

### If database won't start:

```bash
# Remove old data and restart
docker-compose down
docker volume rm aviation_postgres_data
docker-compose up -d
```

### If frontend shows errors:

```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Complete reset:

```bash
# Nuclear option - removes everything
docker-compose down -v
docker rmi aviation-frontend aviation-backend
./deploy-offline.sh
```

---

## 📦 Container Management

### Execute commands in containers:

```bash
# Django shell
docker exec -it aviation_backend python manage.py shell

# Run migrations
docker exec aviation_backend python manage.py migrate

# Collect static files
docker exec aviation_backend python manage.py collectstatic --noinput

# Access database
docker exec -it aviation_postgres psql -U aviation_user -d aviation_db

# View backend files
docker exec aviation_backend ls -la /app

# View frontend files
docker exec aviation_frontend ls -la /usr/share/nginx/html
```

---

## ✅ Pre-Deployment Checklist

- [ ] Docker Desktop is installed and running
- [ ] Base images are loaded (`docker images`)
- [ ] Project files are in /Users/aman/Documents/Aviation
- [ ] Internet is disconnected (for offline test)

---

## ✅ Post-Deployment Verification

```bash
# 1. Check all containers are running
docker-compose ps
# Should show: aviation_backend, aviation_frontend, aviation_postgres

# 2. Test frontend
curl -I http://localhost
# Should return: HTTP/1.1 200 OK

# 3. Test backend
curl -I http://localhost:8000/admin/
# Should return: HTTP/1.1 302 Found

# 4. Check logs for errors
docker-compose logs | grep -i error

# 5. Open browser
open http://localhost
open http://localhost:8000/admin/
```

---

## 💾 Backup Commands

### Export containers (for transfer):

```bash
# Export built images
docker save aviation-frontend -o aviation-frontend.tar
docker save aviation-backend -o aviation-backend.tar

# Export database data
docker exec aviation_postgres pg_dump -U aviation_user aviation_db > backup.sql
```

### Import on another machine:

```bash
# Load images
docker load -i aviation-frontend.tar
docker load -i aviation-backend.tar

# Start containers
docker-compose up -d

# Restore database
cat backup.sql | docker exec -i aviation_postgres psql -U aviation_user aviation_db
```

---

## 🎯 Most Common Workflows

### Daily Start:

```bash
cd /Users/aman/Documents/Aviation
docker-compose up -d
```

### Daily Stop:

```bash
docker-compose stop
```

### Fresh Start:

```bash
docker-compose down
docker-compose up -d
```

### Complete Rebuild:

```bash
./deploy-offline.sh
```

---

**Remember:** All these commands work **100% OFFLINE** once you have the base images! 🎉
