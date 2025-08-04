#!/bin/bash

echo "🚀 Typapp Deployment Script"
echo "=========================="
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
echo "🌐 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. BACKEND DEPLOYMENT (Render - Recommended):"
echo "   - Go to Render.com"
echo "   - Sign up/Login with GitHub"
echo "   - Create New → Web Service"
echo "   - Connect GitHub repository: yusufozbay/typapp"
echo "   - Set root directory to: server"
echo "   - Add environment variables:"
echo "     GEMINI_API_KEY=your_gemini_api_key"
echo "     GOOGLE_APPLICATION_CREDENTIALS=your_service_account_json"
echo "     NODE_ENV=production"
echo ""
echo "   Alternative: Railway.app (same process)"
echo ""
echo "2. FRONTEND DEPLOYMENT (Netlify):"
echo "   - Go to Netlify.com"
echo "   - Connect GitHub repository: yusufozbay/typapp"
echo "   - Build command: cd client && npm install --legacy-peer-deps && npm run build"
echo "   - Publish directory: client/build"
echo "   - Add environment variables:"
echo "     REACT_APP_API_URL=https://your-backend-url.com"
echo "     REACT_APP_GEMINI_API_KEY=your_gemini_api_key"
echo ""
echo "3. GET API KEYS:"
echo "   - Gemini AI: https://makersuite.google.com/app/apikey"
echo "   - Google Cloud: https://console.cloud.google.com"
echo ""
echo "🎉 Your Typapp will be live once both deployments are complete!" 