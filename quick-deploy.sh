#!/bin/bash

echo "🚀 Typapp Quick Deploy Script"
echo "============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Typapp root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm run install-all

echo ""
echo "🔧 Building frontend..."
cd client && npm run build && cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🌐 Your Typapp is ready to deploy!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Backend (Render):"
echo "   - Go to https://render.com"
echo "   - Create Web Service from GitHub: yusufozbay/typapp"
echo "   - Root directory: server"
echo "   - Add GEMINI_API_KEY environment variable"
echo ""
echo "2. Frontend (Netlify):"
echo "   - Go to https://netlify.com"
echo "   - Deploy from GitHub: yusufozbay/typapp"
echo "   - Build command: cd client && npm install --legacy-peer-deps && npm run build"
echo "   - Publish directory: client/build"
echo "   - Add REACT_APP_API_URL environment variable"
echo ""
echo "3. Get API Keys:"
echo "   - Gemini AI: https://makersuite.google.com/app/apikey"
echo ""
echo "🎉 Your simplified Typapp will be live!" 