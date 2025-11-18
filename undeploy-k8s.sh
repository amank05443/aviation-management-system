#!/bin/bash

# Script to remove Aviation application from Kubernetes

set -e

echo "======================================"
echo "Removing Aviation from Kubernetes"
echo "======================================"

# Confirm deletion
read -p "This will delete all Aviation resources. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Deleting Frontend..."
kubectl delete -f k8s/frontend-service.yaml --ignore-not-found=true
kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found=true

echo ""
echo "Deleting Backend..."
kubectl delete -f k8s/backend-service.yaml --ignore-not-found=true
kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found=true

echo ""
echo "Deleting PostgreSQL..."
kubectl delete -f k8s/postgres-service.yaml --ignore-not-found=true
kubectl delete -f k8s/postgres-deployment.yaml --ignore-not-found=true

echo ""
read -p "Delete persistent data (database)? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting PVC..."
    kubectl delete -f k8s/postgres-pvc.yaml --ignore-not-found=true
fi

echo ""
echo "Deleting ConfigMap and Secrets..."
kubectl delete -f k8s/secret.yaml --ignore-not-found=true
kubectl delete -f k8s/configmap.yaml --ignore-not-found=true

echo ""
read -p "Delete namespace? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting namespace..."
    kubectl delete -f k8s/namespace.yaml --ignore-not-found=true
fi

echo ""
echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
