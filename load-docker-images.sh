#!/bin/bash

# Script to load Docker images from saved tar files (for offline use)
# Author: Auto-generated for offline Docker image management

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed and running
echo -e "${BLUE}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}Docker is installed and running!${NC}\n"

# Image directory
IMAGE_DIR="$HOME/docker-images"

# Check if image directory exists
if [ ! -d "$IMAGE_DIR" ]; then
    echo -e "${RED}Error: Image directory not found: ${IMAGE_DIR}${NC}"
    echo "Please run download-docker-images.sh first to download images."
    exit 1
fi

# Count tar files
tar_files=("$IMAGE_DIR"/*.tar)
if [ ! -e "${tar_files[0]}" ]; then
    echo -e "${RED}Error: No .tar files found in ${IMAGE_DIR}${NC}"
    echo "Please run download-docker-images.sh first to download images."
    exit 1
fi

total_files=$(ls -1 "$IMAGE_DIR"/*.tar 2>/dev/null | wc -l)
current=0

echo -e "${YELLOW}Found ${total_files} Docker image(s) to load${NC}"
echo -e "${YELLOW}Loading images from: ${IMAGE_DIR}${NC}\n"

# Load each tar file
for tarfile in "$IMAGE_DIR"/*.tar; do
    ((current++))
    filename=$(basename "$tarfile")

    echo -e "${BLUE}[${current}/${total_files}] Loading: ${filename}${NC}"

    if docker load -i "$tarfile"; then
        echo -e "  ${GREEN}✓ Loaded successfully${NC}\n"
    else
        echo -e "  ${RED}✗ Failed to load${NC}\n"
    fi
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Load Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}Available Docker images:${NC}"
docker images

echo -e "\n${GREEN}All images have been loaded and are ready to use!${NC}"
echo -e "${YELLOW}You can now create new images based on these base images without internet.${NC}"
