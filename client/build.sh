#!/bin/bash

set -e  # Exit on any error

echo "🔧 Building Typapp Frontend..."

# Set Node options for OpenSSL compatibility
export NODE_OPTIONS="--openssl-legacy-provider"

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