#!/bin/bash

# Script to download and save Docker base images for offline use
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

# Create directory for storing images
IMAGE_DIR="$HOME/docker-images"
mkdir -p "$IMAGE_DIR"
echo -e "${BLUE}Images will be saved to: ${IMAGE_DIR}${NC}\n"

# Define images to download
IMAGES=(
    "python:3.11"
    "python:3.11-slim"
    "python:3.11-slim-bullseye"
    "python:3.12"
    "python:3.12-slim"
    "node:20"
    "node:20-alpine"
    "node:18"
    "node:18-alpine"
    "node:22"
    "nginx:alpine"
    "postgres:16"
    "postgres:16-alpine"
    "redis:7-alpine"
)

total_images=${#IMAGES[@]}
current=0

echo -e "${YELLOW}Starting to download ${total_images} Docker images...${NC}"
echo -e "${YELLOW}This may take a while depending on your internet connection.${NC}\n"

# Pull and save each image
for image in "${IMAGES[@]}"; do
    ((current++))

    # Generate filename from image name (replace : and / with -)
    filename=$(echo "$image" | sed 's/[:/]/-/g')
    filename="${filename}.tar"
    filepath="${IMAGE_DIR}/${filename}"

    echo -e "${BLUE}[${current}/${total_images}] Processing: ${image}${NC}"

    # Pull the image
    echo "  - Pulling image..."
    if docker pull "$image"; then
        echo -e "  ${GREEN}✓ Pull successful${NC}"

        # Save the image
        echo "  - Saving to ${filename}..."
        if docker save "$image" -o "$filepath"; then
            size=$(du -h "$filepath" | cut -f1)
            echo -e "  ${GREEN}✓ Saved successfully (${size})${NC}\n"
        else
            echo -e "  ${RED}✗ Failed to save image${NC}\n"
        fi
    else
        echo -e "  ${RED}✗ Failed to pull image${NC}\n"
    fi
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Download Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Images saved to: ${IMAGE_DIR}"
echo -e "\nTotal size:"
du -sh "$IMAGE_DIR"

echo -e "\n${YELLOW}Saved images:${NC}"
ls -lh "$IMAGE_DIR"

echo -e "\n${BLUE}To load these images later (when offline), run:${NC}"
echo -e "${YELLOW}  ./load-docker-images.sh${NC}"

echo -e "\n${BLUE}To verify current images on your system:${NC}"
echo -e "${YELLOW}  docker images${NC}"
