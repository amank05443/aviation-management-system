#!/bin/bash

# Production Deployment Script for Docker Desktop Kubernetes
# This script automates the deployment of the Aviation application

set -e

echo "======================================"
echo "Aviation Production Deployment"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Step 1: Checking prerequisites..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    echo "Please install kubectl and try again"
    exit 1
fi
echo -e "${GREEN}✓ kubectl is installed${NC}"

# Check if Kubernetes is running
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Kubernetes is not running${NC}"
    echo "Please enable Kubernetes in Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓ Kubernetes is running${NC}"

echo ""
echo "Step 2: Building Docker images..."

# Build frontend
echo "Building frontend image..."
cd frontend
if docker build -t aviation-frontend:latest .; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${RED}Error: Frontend build failed${NC}"
    exit 1
fi
cd ..

# Build backend
echo "Building backend image..."
cd backend
if docker build -t aviation-backend:latest .; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}Error: Backend build failed${NC}"
    exit 1
fi
cd ..

echo ""
echo "Step 3: Checking production configuration..."

# Check if secrets have been updated
if grep -q "django-insecure-k8s-secret-key-change-this-in-production" k8s/secret.yaml; then
    echo -e "${YELLOW}⚠ Warning: SECRET_KEY has not been updated!${NC}"
    echo "For production, you should update the SECRET_KEY in k8s/secret.yaml"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Please update k8s/secret.yaml"
        exit 0
    fi
fi

# Check if DEBUG is False
if grep -q 'DEBUG: "True"' k8s/configmap.yaml; then
    echo -e "${YELLOW}⚠ Warning: DEBUG is set to True!${NC}"
    echo "For production, DEBUG should be False in k8s/configmap.yaml"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Please update k8s/configmap.yaml"
        exit 0
    fi
fi

echo ""
echo "Step 4: Deploying to Kubernetes..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"

# Create ConfigMap and Secrets
echo "Creating ConfigMap and Secrets..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
echo -e "${GREEN}✓ ConfigMap and Secrets created${NC}"

# Deploy PostgreSQL
echo "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
echo -e "${GREEN}✓ PostgreSQL resources created${NC}"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready (this may take 1-2 minutes)..."
if kubectl wait --for=condition=ready pod -l app=postgres -n aviation --timeout=180s; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL is taking longer than expected${NC}"
    echo "Continuing anyway..."
fi

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
echo -e "${GREEN}✓ Backend resources created${NC}"

# Wait for Backend
echo "Waiting for Backend to be ready (this may take 2-3 minutes)..."
if kubectl wait --for=condition=ready pod -l app=backend -n aviation --timeout=300s; then
    echo -e "${GREEN}✓ Backend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Backend is taking longer than expected${NC}"
    echo "Check logs with: kubectl logs -n aviation -l app=backend"
fi

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
echo -e "${GREEN}✓ Frontend resources created${NC}"

# Wait for Frontend
echo "Waiting for Frontend to be ready..."
if kubectl wait --for=condition=ready pod -l app=frontend -n aviation --timeout=180s; then
    echo -e "${GREEN}✓ Frontend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Frontend is taking longer than expected${NC}"
fi

echo ""
echo "Step 5: Running database migrations..."
sleep 5  # Give backend a moment to fully stabilize

if kubectl exec -n aviation deployment/backend -- python manage.py migrate; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Migrations may have failed. Check logs.${NC}"
fi

echo ""
echo "======================================"
echo "Deployment Status"
echo "======================================"

kubectl get all -n aviation

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}Your application is now running!${NC}"
echo ""
echo "Access your application at:"
echo "  Frontend: http://localhost"
echo "  Backend Admin: http://localhost/admin"
echo ""
echo "Next steps:"
echo "1. Create a superuser:"
echo "   kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser"
echo ""
echo "2. View logs:"
echo "   kubectl logs -n aviation -l app=backend -f"
echo ""
echo "3. Check status:"
echo "   kubectl get pods -n aviation"
echo ""
echo "4. Scale the application:"
echo "   kubectl scale deployment/backend -n aviation --replicas=3"
echo ""
echo "For detailed instructions, see PRODUCTION_DEPLOYMENT_STEPS.md"
echo ""
