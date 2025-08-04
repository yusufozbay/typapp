#!/bin/bash

# Typapp Backend Deployment Script
# This script helps deploy the backend to various platforms

echo "🚀 Typapp Backend Deployment Guide"
echo "=================================="
echo ""

echo "📋 Prerequisites:"
echo "1. Make sure you have Node.js installed"
echo "2. Set up your environment variables"
echo "3. Choose a deployment platform"
echo ""

echo "🔧 Environment Setup:"
echo "1. Copy env.example to .env in the server directory"
echo "2. Add your Google Drive service account key"
echo "3. Add your Gemini API key"
echo ""

echo "🌐 Deployment Options:"
echo ""
echo "Option 1: Render (Recommended)"
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Set build command: cd server && npm install"
echo "5. Set start command: cd server && node index.js"
echo "6. Add environment variables:"
echo "   - GOOGLE_APPLICATION_CREDENTIALS: ./service-account-key.json"
echo "   - GEMINI_API_KEY: your_gemini_api_key"
echo "   - NODE_ENV: production"
echo ""

echo "Option 2: Railway"
echo "1. Go to https://railway.app"
echo "2. Create a new project"
echo "3. Connect your GitHub repository"
echo "4. Set the root directory to 'server'"
echo "5. Add environment variables"
echo ""

echo "Option 3: Heroku"
echo "1. Install Heroku CLI"
echo "2. Run: heroku create your-app-name"
echo "3. Run: git subtree push --prefix server heroku main"
echo "4. Add environment variables in Heroku dashboard"
echo ""

echo "🔗 After Deployment:"
echo "1. Get your backend URL (e.g., https://your-app.onrender.com)"
echo "2. Update netlify.toml with the correct backend URL"
echo "3. Update environment variables in Netlify dashboard"
echo ""

echo "📝 Example netlify.toml update:"
echo "Replace 'https://your-backend-url.com' with your actual backend URL"
echo ""

echo "✅ Next Steps:"
echo "1. Deploy your backend using one of the options above"
echo "2. Update the frontend configuration with your backend URL"
echo "3. Test the connection"
echo ""

echo "Need help? Check the README.md for detailed instructions." 