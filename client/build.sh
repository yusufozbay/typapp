#!/bin/bash

echo "🔧 Building Typapp Frontend..."

# Clean install with force
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --force

# Try to fix any remaining issues
echo "🔧 Fixing dependency issues..."
npm audit fix --force || true

# Build the application with legacy OpenSSL provider
echo "🏗️ Building React app..."
export NODE_OPTIONS="--openssl-legacy-provider"
npm run build

echo "✅ Build completed!" 