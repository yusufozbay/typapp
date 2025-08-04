#!/bin/bash

# Force Netlify Redeploy Script
# This script forces a redeploy of your Netlify site with the latest UI changes

echo "🚀 Force Netlify Redeploy"
echo "========================="
echo ""

echo "✅ Backend Status Check:"
curl -s https://typapp-backend.onrender.com/api/health
echo ""
echo ""

echo "📝 Creating a small change to trigger redeploy..."
echo "// Force redeploy - $(date)" >> ../client/src/App.tsx

echo "🔄 Committing and pushing changes..."
cd ..
git add .
git commit -m "Force redeploy with latest UI changes - $(date)"
git push origin main

echo ""
echo "✅ Changes pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to your Netlify dashboard"
echo "2. Check the 'Deploys' tab"
echo "3. Wait for the new deployment to complete (2-3 minutes)"
echo "4. Visit your site to see the updated UI"
echo ""
echo "🎯 Expected Results:"
echo "- Modern glassmorphism UI design"
echo "- 'Connected' status instead of 'Disconnected'"
echo "- Working file upload functionality"
echo "- No more connection errors"
echo ""
echo "🔧 If you still see the old UI:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Try opening in an incognito/private window"
echo "3. Check Netlify deployment logs for any errors" 