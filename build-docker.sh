#!/bin/bash

# Script to build Docker images for Aviation application

set -e

echo "======================================"
echo "Building Aviation Docker Images"
echo "======================================"

# Build frontend image
echo ""
echo "Building Frontend Image..."
cd frontend
docker build -t aviation-frontend:latest .
cd ..

echo ""
echo "Building Backend Image..."
cd backend
docker build -t aviation-backend:latest .
cd ..

echo ""
echo "======================================"
echo "Build Complete!"
echo "======================================"
echo ""
echo "Images created:"
docker images | grep aviation

echo ""
echo "To run with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To run on Kubernetes:"
echo "  kubectl apply -f k8s/"
echo ""
