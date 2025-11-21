# Offline Deployment Guide

This guide will help you build and run your Aviation application completely **OFFLINE** using the base Docker images you've already downloaded.

## Prerequisites

✅ Docker Desktop installed and running
✅ Base images downloaded (python, node, postgres, nginx)
✅ Internet disconnected

## Quick Start (All Commands)

```bash
# 1. Navigate to project directory
cd /Users/aman/Documents/Aviation

# 2. Verify Docker is running
docker --version

# 3. Verify base images are available
docker images | grep -E "(python|node|postgres|nginx)"

# 4. Build the images (OFFLINE)
docker-compose build

# 5. Start all containers
docker-compose up -d

# 6. Verify containers are running
docker-compose ps

# 7. Check logs
docker-compose logs -f

# 8. Create superuser (optional, if needed)
docker cp create_superuser.py aviation_backend:/app/
docker exec aviation_backend python /app/create_superuser.py
```

## Detailed Step-by-Step Instructions

### Step 1: Prepare Environment

```bash
# Navigate to project directory
cd /Users/aman/Documents/Aviation

# Verify Docker Desktop is running
docker info
```

**Expected output:** Docker information without errors

---

### Step 2: Verify Base Images (IMPORTANT)

```bash
# Check if base images are available
docker images
```

**You should see:**
- `python:3.11-slim`
- `node:18-alpine`
- `nginx:alpine`
- `postgres:15-alpine`

**If missing:** Load from saved tar files:
```bash
./load-docker-images.sh
```

---

### Step 3: Build Application Images (OFFLINE)

```bash
# Build both frontend and backend images
docker-compose build
```

**This will:**
- Build `aviation-frontend` using `node:18-alpine` and `nginx:alpine`
- Build `aviation-backend` using `python:3.11-slim`
- Take 5-10 minutes
- Work completely offline!

**Expected output:**
```
Successfully built aviation-frontend
Successfully built aviation-backend
```

---

### Step 4: Start All Services

```bash
# Start all containers in detached mode
docker-compose up -d
```

**This will start:**
- PostgreSQL database
- Django backend (with migrations)
- React frontend with Nginx

**Expected output:**
```
Creating aviation_postgres  ... done
Creating aviation_backend   ... done
Creating aviation_frontend  ... done
```

---

### Step 5: Verify Everything is Running

```bash
# Check container status
docker-compose ps
```

**Expected output:**
```
NAME                STATUS
aviation_postgres   Up (healthy)
aviation_backend    Up
aviation_frontend   Up
```

```bash
# Check logs (all services)
docker-compose logs

# Or check individual services
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

---

### Step 6: Access Application

**Frontend:**
```
http://localhost
```

**Admin Panel:**
```
http://localhost:8000/admin/
```

**Login Credentials:**
- PNO: `ADMIN001`
- Password: `admin123`

---

### Step 7: Create Superuser (If Needed)

If you need to create a new superuser:

```bash
# Copy the script to container
docker cp create_superuser.py aviation_backend:/app/

# Run the script
docker exec aviation_backend python /app/create_superuser.py
```

---

## Common Commands

### Start/Stop Services

```bash
# Stop all containers
docker-compose stop

# Start all containers
docker-compose start

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Execute Commands in Containers

```bash
# Django shell
docker exec -it aviation_backend python manage.py shell

# Database migrations
docker exec aviation_backend python manage.py migrate

# Collect static files
docker exec aviation_backend python manage.py collectstatic --noinput

# Access PostgreSQL
docker exec -it aviation_postgres psql -U aviation_user -d aviation_db
```

### Check Container Status

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Check resource usage
docker stats

# Inspect container
docker inspect aviation_backend
```

---

## Troubleshooting

### Problem: Base images not found

**Solution:**
```bash
# Load images from tar files
cd ~
./load-docker-images.sh

# Or load specific image
docker load -i ~/docker-images/python-3.11-slim.tar
docker load -i ~/docker-images/node-18-alpine.tar
docker load -i ~/docker-images/nginx-alpine.tar
docker load -i ~/docker-images/postgres-15-alpine.tar
```

---

### Problem: Port already in use

**Error:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution:**
```bash
# Find what's using the port
lsof -i :80
lsof -i :8000

# Stop the conflicting service or change ports in docker-compose.yml
```

---

### Problem: Database connection failed

**Solution:**
```bash
# Check if database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait for database to be ready, then restart backend
docker-compose restart backend
```

---

### Problem: Frontend shows errors

**Solution:**
```bash
# Rebuild frontend
docker-compose build frontend

# Restart frontend
docker-compose restart frontend

# Check nginx logs
docker-compose logs frontend
```

---

### Problem: Need to rebuild everything

```bash
# Stop everything
docker-compose down

# Remove volumes (WARNING: deletes data)
docker volume rm aviation_postgres_data aviation_static_volume aviation_media_volume

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

---

## Complete Cleanup and Rebuild

If you want to start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove built images
docker rmi aviation-frontend aviation-backend

# Rebuild from scratch (OFFLINE)
docker-compose build

# Start services
docker-compose up -d

# Create superuser
docker cp create_superuser.py aviation_backend:/app/
docker exec aviation_backend python /app/create_superuser.py
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Docker Desktop (OFFLINE)          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │        │
│  │  (React +    │  │  (Django +   │        │
│  │   Nginx)     │  │  Gunicorn)   │        │
│  │              │  │              │        │
│  │  Port: 80    │  │  Port: 8000  │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │
│         │                 │                 │
│         │          ┌──────▼───────┐         │
│         │          │  PostgreSQL  │         │
│         │          │              │         │
│         │          │  Port: 5432  │         │
│         │          └──────────────┘         │
│         │                                    │
│  ┌──────▼─────────────────────────┐         │
│  │  Docker Network                │         │
│  │  (aviation_aviation_network)   │         │
│  └────────────────────────────────┘         │
│                                             │
└─────────────────────────────────────────────┘

Base Images Used:
- node:18-alpine (Frontend build)
- nginx:alpine (Frontend runtime)
- python:3.11-slim (Backend)
- postgres:15-alpine (Database)
```

---

## Verify Offline Capability

To test that everything works offline:

1. **Disconnect from internet** (Turn off WiFi)

2. **Run the complete workflow:**
   ```bash
   cd /Users/aman/Documents/Aviation
   docker-compose build
   docker-compose up -d
   docker-compose ps
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Admin: http://localhost:8000/admin/

4. **Everything should work without internet!** ✅

---

## Files Required for Offline Deployment

Make sure these files exist:

```
Aviation/
├── docker-compose.yml          # Orchestration config
├── backend/
│   ├── Dockerfile             # Backend image definition
│   ├── requirements.txt       # Python dependencies
│   └── docker-entrypoint.sh   # Startup script
├── frontend/
│   ├── Dockerfile             # Frontend image definition
│   ├── package.json           # Node dependencies
│   └── nginx.conf             # Nginx configuration
├── create_superuser.py        # Superuser creation script
└── ~/docker-images/           # Saved base images
    ├── python-3.11-slim.tar
    ├── node-18-alpine.tar
    ├── nginx-alpine.tar
    └── postgres-15-alpine.tar
```

---

## Success Checklist

- ✅ Docker Desktop is running
- ✅ Base images are loaded
- ✅ `docker-compose build` completes without errors
- ✅ All 3 containers are running (frontend, backend, database)
- ✅ Frontend accessible at http://localhost
- ✅ Backend accessible at http://localhost:8000
- ✅ Can login to admin panel
- ✅ All working **WITHOUT INTERNET** 🎉

---

## Support

If you encounter issues:

1. Check Docker Desktop is running
2. Verify base images exist: `docker images`
3. Check container logs: `docker-compose logs`
4. Restart Docker Desktop
5. Try complete cleanup and rebuild

---

**Last Updated:** November 21, 2025
**Version:** 1.0
