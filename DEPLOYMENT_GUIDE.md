# Aviation Management System - Deployment Guide

## Current Architecture
- **Backend (Django)**: Port 8000
- **Frontend (React)**: Port 3000

## Table of Contents
1. [Single Port Setup (Development)](#single-port-setup-development)
2. [Production Deployment](#production-deployment)
3. [Deployment Checklist](#deployment-checklist)

---

## Single Port Setup (Development)

### Option 1: Django Serves React Build (Recommended)

#### Step 1: Build React for Production
```bash
cd /Users/aman/Documents/Aviation/frontend
npm run build
```
This creates an optimized production build in `frontend/build/`.

#### Step 2: Configure Django to Serve React

**Update `backend/aviation_project/settings.py`:**

```python
import os

# Add this to TEMPLATES 'DIRS':
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, '../frontend/build')],  # Add this
        'APP_DIRS': True,
        ...
    },
]

# Update STATIC settings:
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '../frontend/build/static'),
]
```

**Update `backend/aviation_project/urls.py`:**

```python
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aviation_app.urls')),
    # Serve React app for all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

#### Step 3: Run on Single Port
```bash
cd backend
python3 manage.py collectstatic --noinput
python3 manage.py runserver
```

Now access everything at: **http://localhost:8000**

---

## Production Deployment

### Prerequisites
- Server (AWS EC2, DigitalOcean, Heroku, Railway, etc.)
- Domain name (optional but recommended)
- PostgreSQL database (recommended over SQLite)

### Deployment Platforms

#### Option 1: Railway (Easiest - Recommended for Beginners)

**1. Install Railway CLI:**
```bash
npm install -g @railway/cli
```

**2. Login to Railway:**
```bash
railway login
```

**3. Create railway.json in project root:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn aviation_project.wsgi:application --bind 0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**4. Deploy:**
```bash
railway init
railway up
```

#### Option 2: AWS EC2 (Full Control)

**1. Launch EC2 Instance**
- Ubuntu 22.04 LTS
- t2.micro (or larger)
- Open ports: 80, 443, 22

**2. Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y
```

**3. Setup PostgreSQL:**
```bash
sudo -u postgres psql

CREATE DATABASE aviation_db;
CREATE USER aviation_user WITH PASSWORD 'your_secure_password';
ALTER ROLE aviation_user SET client_encoding TO 'utf8';
ALTER ROLE aviation_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE aviation_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aviation_db TO aviation_user;
\q
```

**4. Clone and Setup Project:**
```bash
cd /home/ubuntu
git clone https://github.com/amank05443/aviation-management-system.git
cd aviation-management-system

# Setup Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Setup Frontend
cd ../frontend
npm install
npm run build
```

**5. Create Gunicorn Service:**

Create `/etc/systemd/system/aviation.service`:
```ini
[Unit]
Description=Aviation Management Gunicorn Service
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/aviation-management-system/backend
Environment="PATH=/home/ubuntu/aviation-management-system/backend/venv/bin"
ExecStart=/home/ubuntu/aviation-management-system/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/ubuntu/aviation-management-system/backend/aviation.sock \
          aviation_project.wsgi:application

[Install]
WantedBy=multi-user.target
```

**6. Start Gunicorn:**
```bash
sudo systemctl start aviation
sudo systemctl enable aviation
```

**7. Configure Nginx:**

Create `/etc/nginx/sites-available/aviation`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use IP address

    # Serve React static files
    location / {
        root /home/ubuntu/aviation-management-system/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API requests
    location /api/ {
        proxy_pass http://unix:/home/ubuntu/aviation-management-system/backend/aviation.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin
    location /admin/ {
        proxy_pass http://unix:/home/ubuntu/aviation-management-system/backend/aviation.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django static files
    location /static/ {
        alias /home/ubuntu/aviation-management-system/backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/aviation-management-system/backend/media/;
    }
}
```

**8. Enable Nginx Site:**
```bash
sudo ln -s /etc/nginx/sites-available/aviation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**9. Setup SSL (Optional but Recommended):**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Deployment Checklist

### Backend Configuration

**1. Create `.env` file in backend:**
```bash
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=postgresql://aviation_user:password@localhost:5432/aviation_db
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-ip-address
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

**2. Update `settings.py` for Production:**
```python
import os
from pathlib import Path
import dj_database_url  # pip install dj-database-url

DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-key')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database - Use PostgreSQL in production
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    # SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Security Settings (Add these)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# CORS - Update for production
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

# Static Files (Production)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '../frontend/build/static'),
]

# WhiteNoise for serving static files (pip install whitenoise)
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

**3. Create `requirements.txt` if not exists:**
```bash
cd backend
pip freeze > requirements.txt
```

Add these to requirements.txt:
```
gunicorn
psycopg2-binary
dj-database-url
whitenoise
python-decouple
```

### Frontend Configuration

**1. Update `package.json`:**
```json
{
  "proxy": "http://localhost:8000",
  "homepage": "."
}
```

**2. Create `.env.production` in frontend:**
```bash
REACT_APP_API_URL=https://your-domain.com
```

**3. Update API calls in frontend:**
```javascript
// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;
```

### Security Checklist

- [ ] Change SECRET_KEY to a strong random value
- [ ] Set DEBUG=False in production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/SSL
- [ ] Set proper ALLOWED_HOSTS
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Remove `.env` from git (add to .gitignore)
- [ ] Use environment variables for sensitive data
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring (Sentry, New Relic, etc.)

### Performance Optimization

- [ ] Enable Gzip compression in Nginx
- [ ] Set up static file caching
- [ ] Use CDN for static files (optional)
- [ ] Enable Django caching (Redis/Memcached)
- [ ] Optimize database queries
- [ ] Set up database connection pooling
- [ ] Configure proper worker count for Gunicorn

### Monitoring & Maintenance

- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure automated backups
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Create staging environment
- [ ] Document deployment process

---

## Quick Deploy Commands

### Build & Deploy (Local Testing)
```bash
# Build frontend
cd frontend
npm run build

# Collect static files
cd ../backend
python3 manage.py collectstatic --noinput

# Run migrations
python3 manage.py migrate

# Run server
gunicorn aviation_project.wsgi:application --bind 0.0.0.0:8000
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py collectstatic --noinput
sudo systemctl restart aviation

# Update frontend
cd ../frontend
npm install
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

---

## Troubleshooting

### Static Files Not Loading
```bash
python3 manage.py collectstatic --noinput
sudo systemctl restart aviation
sudo systemctl restart nginx
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U aviation_user -d aviation_db -h localhost
```

### Check Logs
```bash
# Gunicorn logs
sudo journalctl -u aviation -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Cost Estimates

### Hosting Options:
1. **Railway**: $5-10/month (easiest)
2. **DigitalOcean Droplet**: $6-12/month
3. **AWS EC2 t2.micro**: ~$10/month
4. **Heroku**: $7-25/month
5. **Vercel (Frontend) + Railway (Backend)**: $0-15/month

### Additional Costs:
- Domain name: $10-15/year
- SSL Certificate: Free (Let's Encrypt)
- Database backup storage: $1-5/month

---

## Recommended Setup for Beginners

**Option 1: Railway (All-in-One)**
- Easiest deployment
- Automatic HTTPS
- Built-in PostgreSQL
- Git-based deployment
- Cost: ~$5-10/month

**Option 2: Vercel + Railway**
- Frontend on Vercel (Free tier available)
- Backend on Railway ($5/month)
- Excellent performance
- Easy CI/CD

---

For questions or issues, refer to:
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/
- React Deployment: https://create-react-app.dev/docs/deployment/
- Railway Docs: https://docs.railway.app/
