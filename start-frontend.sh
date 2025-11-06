#!/bin/bash

echo "=========================================="
echo "🚀 Starting Aviation Frontend Server"
echo "=========================================="
echo ""

cd "$(dirname "$0")/frontend"

echo "📍 Current directory: $(pwd)"
echo "🔍 Checking Node version..."
node --version
echo "🔍 Checking NPM version..."
npm --version

echo ""
echo "🚀 Starting React development server..."
echo "✓ Frontend will be available at: http://localhost:3000"
echo "✓ Will automatically open in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

npm start
