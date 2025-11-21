# Docker Offline Setup Guide

This guide helps you download Docker Desktop and base images for offline development.

## Prerequisites

### Step 1: Download Docker Desktop for macOS

1. Visit: https://www.docker.com/products/docker-desktop
2. Click "Download for Mac"
3. Choose your Mac type:
   - **Apple Silicon (M1/M2/M3)**: Download "Mac with Apple chip"
   - **Intel**: Download "Mac with Intel chip"
4. Install Docker Desktop:
   - Open the `.dmg` file
   - Drag Docker to Applications
   - Launch Docker Desktop
   - Complete the setup wizard

### Step 2: Verify Docker Installation

Open Terminal and run:
```bash
docker --version
docker info
```

If both commands work, Docker is ready!

## Using the Automation Scripts

### Download and Save Images (While Online)

1. Make the script executable:
```bash
chmod +x download-docker-images.sh
```

2. Run the download script:
```bash
./download-docker-images.sh
```

This will:
- Download all base images (Python, Node.js, Nginx, PostgreSQL, Redis)
- Save them as `.tar` files in `~/docker-images/`
- Show progress for each image

**Note**: This may take 10-30 minutes depending on your internet speed.

### Load Images (When Offline)

1. Make the script executable:
```bash
chmod +x load-docker-images.sh
```

2. Run the load script:
```bash
./load-docker-images.sh
```

This will:
- Load all saved images from `~/docker-images/`
- Make them available for use without internet

## Images Included

### Python/Django Images
- `python:3.11` - Full Python 3.11
- `python:3.11-slim` - Lightweight Python 3.11
- `python:3.11-slim-bullseye` - Slim version with Debian Bullseye
- `python:3.12` - Full Python 3.12
- `python:3.12-slim` - Lightweight Python 3.12

### Node.js Images
- `node:20` - Full Node.js 20 (LTS)
- `node:20-alpine` - Lightweight Node.js 20
- `node:18` - Full Node.js 18 (LTS)
- `node:18-alpine` - Lightweight Node.js 18
- `node:22` - Latest Node.js 22

### Additional Images
- `nginx:alpine` - Web server
- `postgres:16` - PostgreSQL database
- `postgres:16-alpine` - Lightweight PostgreSQL
- `redis:7-alpine` - Redis cache

## Manual Commands

### Pull a Single Image
```bash
docker pull python:3.11
```

### Save a Single Image
```bash
docker save python:3.11 -o ~/docker-images/python-3.11.tar
```

### Load a Single Image
```bash
docker load -i ~/docker-images/python-3.11.tar
```

### View Downloaded Images
```bash
docker images
```

### Check Saved Files
```bash
ls -lh ~/docker-images/
```

## Using Base Images in Your Dockerfile

Once images are loaded, use them in your Dockerfile:

### For Django/Python Project:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### For Node.js Project:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
```

### Multi-stage Build (Python + Node.js):
```dockerfile
# Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --from=frontend /app/frontend/build ./static
COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Building Images Offline

Once base images are loaded:

```bash
# Build your custom image
docker build -t myapp:latest .

# Run your container
docker run -p 8000:8000 myapp:latest
```

## Storage Requirements

Approximate sizes:
- Python images: 1-2 GB total
- Node.js images: 1-2 GB total
- Additional images: 500 MB - 1 GB
- **Total**: ~3-5 GB

Ensure you have sufficient disk space before downloading.

## Transferring Images to Another Computer

### Export all images:
```bash
# On source computer (with internet)
./download-docker-images.sh

# Copy the entire folder
cp -r ~/docker-images /path/to/external/drive
```

### Import on destination computer:
```bash
# Copy folder to destination
cp -r /path/to/external/drive/docker-images ~/

# Load images
./load-docker-images.sh
```

## Troubleshooting

### Docker daemon not running
```bash
# Start Docker Desktop from Applications folder
open -a Docker
```

### Permission denied
```bash
chmod +x download-docker-images.sh
chmod +x load-docker-images.sh
```

### Out of disk space
```bash
# Check Docker disk usage
docker system df

# Clean up unused images (careful!)
docker system prune -a
```

### Image not found when building
```bash
# List available images
docker images

# Verify image name matches your Dockerfile
```

## Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Hub (browse images): https://hub.docker.com
- Django with Docker: https://docs.docker.com/samples/django/
- Node.js with Docker: https://docs.docker.com/samples/nodejs/

## Updating Images

To update images with newer versions:

1. Connect to internet
2. Run `./download-docker-images.sh` again
3. It will download the latest versions and overwrite old files

## Support

If you encounter issues:
1. Ensure Docker Desktop is running
2. Check Docker version: `docker --version`
3. View logs: Docker Desktop > Preferences > Troubleshoot
