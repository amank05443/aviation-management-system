#!/bin/bash

# Aviation Management System - Single Port Setup Script
# This script builds React and serves everything on Django port 8000

echo "🚀 Setting up Aviation Management System on single port..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Build React
echo "📦 Building React frontend..."
cd "$SCRIPT_DIR/frontend"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

echo "✅ React build completed!"
echo ""

# Step 2: Collect Django static files
echo "📂 Collecting Django static files..."
cd "$SCRIPT_DIR/backend"
python3 manage.py collectstatic --noinput

if [ $? -ne 0 ]; then
    echo "❌ Failed to collect static files!"
    exit 1
fi

echo "✅ Static files collected!"
echo ""

# Step 3: Run migrations (just in case)
echo "🔄 Running database migrations..."
python3 manage.py migrate

echo "✅ Migrations completed!"
echo ""

# Step 4: Start Django server
echo "🎉 Starting server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
python3 manage.py runserver
