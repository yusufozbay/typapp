#!/bin/bash

# Typapp Backend URL Update Script
# This script helps you quickly update your backend URL in all configuration files

echo "🔧 Typapp Backend URL Update Script"
echo "===================================="
echo ""

# Check if backend URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your backend URL"
    echo ""
    echo "Usage: ./update-backend-url.sh YOUR_BACKEND_URL"
    echo "Example: ./update-backend-url.sh https://typapp-backend.onrender.com"
    echo ""
    echo "🔍 To get your backend URL:"
    echo "1. Deploy your backend to Render/Railway/Heroku"
    echo "2. Copy the URL from your deployment dashboard"
    echo "3. Run this script with the URL"
    exit 1
fi

BACKEND_URL=$1

echo "✅ Updating backend URL to: $BACKEND_URL"
echo ""

# Update netlify.toml
echo "📝 Updating netlify.toml..."
sed -i.bak "s|https://your-deployed-backend-url.com|$BACKEND_URL|g" netlify.toml
sed -i.bak "s|https://your-backend-url.com|$BACKEND_URL|g" netlify.toml

# Update any other files that might need the URL
echo "📝 Checking for other files that need updating..."

# Remove backup files
rm -f netlify.toml.bak

echo ""
echo "✅ Backend URL updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push these changes:"
echo "   git add . && git commit -m 'Update backend URL' && git push origin main"
echo ""
echo "2. Update Netlify environment variables:"
echo "   - Go to your Netlify dashboard"
echo "   - Site settings → Environment variables"
echo "   - Add REACT_APP_API_URL = $BACKEND_URL"
echo ""
echo "3. Test your application:"
echo "   - Visit your Netlify site"
echo "   - Check if 'Connected' status appears"
echo "   - Try uploading a file"
echo ""
echo "🎉 Your Typapp should now work without CORS errors!" 