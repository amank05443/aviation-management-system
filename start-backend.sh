#!/bin/bash

echo "=========================================="
echo "🚀 Starting Aviation Backend Server"
echo "=========================================="
echo ""

cd "$(dirname "$0")/backend"

echo "📍 Current directory: $(pwd)"
echo "🔍 Checking Python version..."
python3 --version

echo ""
echo "🚀 Starting Django development server..."
echo "✓ Backend will be available at: http://localhost:8000"
echo "✓ API endpoints: http://localhost:8000/api/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

python3 manage.py runserver
