#!/bin/bash

# Aviation Application - Offline Deployment Script
# This script builds and deploys the application without internet

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Aviation App - Offline Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Check Docker is running
echo -e "${BLUE}[1/7] Checking Docker...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}\n"

# Step 2: Verify base images
echo -e "${BLUE}[2/7] Verifying base images...${NC}"
required_images=("python:3.11-slim" "node:18-alpine" "nginx:alpine" "postgres:15-alpine")
missing_images=()

for image in "${required_images[@]}"; do
    if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${image}$"; then
        missing_images+=("$image")
    fi
done

if [ ${#missing_images[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warning: Missing base images:${NC}"
    for img in "${missing_images[@]}"; do
        echo "  - $img"
    done
    echo -e "\n${BLUE}Loading images from ~/docker-images/...${NC}"
    if [ -f "./load-docker-images.sh" ]; then
        ./load-docker-images.sh
    elif [ -f "$HOME/load-docker-images.sh" ]; then
        $HOME/load-docker-images.sh
    else
        echo -e "${RED}Error: Cannot find load script!${NC}"
        echo "Please run ./load-docker-images.sh first"
        exit 1
    fi
else
    echo -e "${GREEN}✓ All base images found${NC}\n"
fi

# Step 3: Navigate to project directory
echo -e "${BLUE}[3/7] Navigating to project directory...${NC}"
cd "$(dirname "$0")"
echo -e "${GREEN}✓ In directory: $(pwd)${NC}\n"

# Step 4: Build images
echo -e "${BLUE}[4/7] Building Docker images (this may take 5-10 minutes)...${NC}"
if docker-compose build; then
    echo -e "${GREEN}✓ Images built successfully${NC}\n"
else
    echo -e "${RED}Error: Failed to build images${NC}"
    exit 1
fi

# Step 5: Start containers
echo -e "${BLUE}[5/7] Starting containers...${NC}"
if docker-compose up -d; then
    echo -e "${GREEN}✓ Containers started${NC}\n"
else
    echo -e "${RED}Error: Failed to start containers${NC}"
    exit 1
fi

# Step 6: Wait for services to be ready
echo -e "${BLUE}[6/7] Waiting for services to be ready...${NC}"
echo "Waiting for database..."
sleep 10

echo "Waiting for backend..."
max_attempts=30
attempt=0
until curl -s http://localhost:8000/admin/ > /dev/null || [ $attempt -eq $max_attempts ]; do
    echo -n "."
    sleep 2
    ((attempt++))
done
echo ""

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}Warning: Backend might not be fully ready yet${NC}"
else
    echo -e "${GREEN}✓ Backend is ready${NC}"
fi

echo "Waiting for frontend..."
sleep 5
if curl -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✓ Frontend is ready${NC}\n"
else
    echo -e "${YELLOW}Warning: Frontend might not be fully ready yet${NC}\n"
fi

# Step 7: Display status
echo -e "${BLUE}[7/7] Checking container status...${NC}"
docker-compose ps
echo ""

# Create superuser if script exists
if [ -f "create_superuser.py" ]; then
    echo -e "${BLUE}Creating superuser...${NC}"
    docker cp create_superuser.py aviation_backend:/app/
    docker exec aviation_backend python /app/create_superuser.py
    echo ""
fi

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Access your application:${NC}"
echo -e "  Frontend:    ${BLUE}http://localhost${NC}"
echo -e "  Admin Panel: ${BLUE}http://localhost:8000/admin/${NC}"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo -e "  PNO:      ${GREEN}ADMIN001${NC}"
echo -e "  Password: ${GREEN}admin123${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:        ${BLUE}docker-compose logs -f${NC}"
echo -e "  Stop containers:  ${BLUE}docker-compose stop${NC}"
echo -e "  Start containers: ${BLUE}docker-compose start${NC}"
echo -e "  Remove all:       ${BLUE}docker-compose down${NC}"
echo ""
echo -e "${GREEN}All services are running OFFLINE! ✅${NC}\n"
