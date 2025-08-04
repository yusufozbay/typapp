#!/bin/bash

echo "🔧 Building Typapp Frontend..."

# Clean install with force
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --force

# Try to fix any remaining issues
echo "🔧 Fixing dependency issues..."
npm audit fix --force || true

# Build the application
echo "🏗️ Building React app..."
npm run build

echo "✅ Build completed!" 