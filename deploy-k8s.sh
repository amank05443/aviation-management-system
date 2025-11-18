#!/bin/bash

# Script to deploy Aviation application to Kubernetes

set -e

echo "======================================"
echo "Deploying Aviation to Kubernetes"
echo "======================================"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Check if images exist
if ! docker images | grep -q aviation-frontend; then
    echo "Error: aviation-frontend image not found. Run ./build-docker.sh first"
    exit 1
fi

if ! docker images | grep -q aviation-backend; then
    echo "Error: aviation-backend image not found. Run ./build-docker.sh first"
    exit 1
fi

# For Minikube, load images into Minikube
if kubectl config current-context | grep -q minikube; then
    echo ""
    echo "Detected Minikube, loading images..."
    eval $(minikube docker-env)

    echo "Rebuilding images in Minikube..."
    docker build -t aviation-frontend:latest ./frontend
    docker build -t aviation-backend:latest ./backend
fi

# Apply Kubernetes manifests
echo ""
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "Creating ConfigMap and Secrets..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

echo ""
echo "Deploying PostgreSQL..."
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

echo ""
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n aviation --timeout=120s || true

echo ""
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

echo ""
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n aviation --timeout=120s || true

echo ""
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"

echo ""
echo "Checking deployment status..."
kubectl get all -n aviation

echo ""
echo "To access the application:"
if kubectl config current-context | grep -q minikube; then
    echo "  minikube service frontend-service -n aviation"
elif kubectl config current-context | grep -q docker-desktop; then
    echo "  http://localhost (wait for LoadBalancer to assign IP)"
else
    echo "  kubectl get svc -n aviation frontend-service (wait for EXTERNAL-IP)"
fi

echo ""
echo "To view logs:"
echo "  kubectl logs -n aviation -l app=backend -f"
echo "  kubectl logs -n aviation -l app=frontend -f"
echo ""
echo "To run migrations:"
echo "  kubectl exec -n aviation deployment/backend -- python manage.py migrate"
echo ""
echo "To create superuser:"
echo "  kubectl exec -it -n aviation deployment/backend -- python manage.py createsuperuser"
echo ""
