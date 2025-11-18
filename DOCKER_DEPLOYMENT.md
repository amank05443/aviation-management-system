# Docker Deployment Guide

This guide explains how to build and run the Aviation application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Project Structure

```
Aviation/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── .dockerignore
├── docker-compose.yml
└── .env.example
```

## Quick Start with Docker Compose

### 1. Build and Run All Services

```bash
# Build and start all services (frontend, backend, postgres)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 2. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **PostgreSQL**: localhost:5432

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

## Building Individual Images

### Build Frontend Image

```bash
cd frontend
docker build -t aviation-frontend:latest .
```

### Build Backend Image

```bash
cd backend
docker build -t aviation-backend:latest .
```

## Running Individual Containers

### Run PostgreSQL Container

```bash
docker run -d \
  --name aviation_postgres \
  -e POSTGRES_DB=aviation_db \
  -e POSTGRES_USER=aviation_user \
  -e POSTGRES_PASSWORD=aviation_password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Run Backend Container

```bash
docker run -d \
  --name aviation_backend \
  -p 8000:8000 \
  -e DB_ENGINE=django.db.backends.postgresql \
  -e DB_NAME=aviation_db \
  -e DB_USER=aviation_user \
  -e DB_PASSWORD=aviation_password \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  --link aviation_postgres:postgres \
  aviation-backend:latest
```

### Run Frontend Container

```bash
docker run -d \
  --name aviation_frontend \
  -p 80:80 \
  --link aviation_backend:backend \
  aviation-frontend:latest
```

## Database Management

### Run Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Collect Static Files

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### Access PostgreSQL Shell

```bash
docker-compose exec db psql -U aviation_user -d aviation_db
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your production values:

```env
DEBUG=False
SECRET_KEY=your-production-secret-key-here
DB_PASSWORD=your-secure-password-here
```

## Production Deployment

### 1. Update Environment Variables

- Set `DEBUG=False`
- Use a strong `SECRET_KEY`
- Set proper `ALLOWED_HOSTS`
- Use secure database password
- Configure CORS origins

### 2. Build for Production

```bash
docker-compose -f docker-compose.yml up -d --build
```

### 3. Health Checks

Monitor service health:

```bash
docker-compose ps
docker-compose logs -f
```

## Troubleshooting

### Backend can't connect to database

```bash
# Check if postgres is running
docker-compose ps db

# Check postgres logs
docker-compose logs db

# Restart services
docker-compose restart backend
```

### Frontend can't reach backend

Check nginx configuration in `frontend/nginx.conf` and ensure proxy_pass points to `http://backend:8000`

### Permission Issues

```bash
# Fix ownership of volumes
docker-compose exec backend chown -R www-data:www-data /app/staticfiles /app/media
```

## Maintenance

### Update Images

```bash
# Rebuild images with latest changes
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U aviation_user aviation_db > backup.sql

# Restore backup
docker-compose exec -T db psql -U aviation_user aviation_db < backup.sql
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune -a

# Remove unused volumes (WARNING: deletes data)
docker volume prune
```
