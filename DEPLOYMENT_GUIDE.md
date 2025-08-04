# 🚀 Typapp Deployment Guide

## Overview
This guide will help you deploy Typapp and fix the CORS issues you're experiencing. The application consists of:
- **Frontend**: React app deployed on Netlify
- **Backend**: Node.js/Express server (needs to be deployed)

## 🔧 Current Issues
- CORS errors preventing frontend-backend communication
- Backend not deployed (using placeholder URLs)
- Google Drive integration not working

## 📋 Prerequisites
1. Node.js installed
2. Google Cloud Console account
3. Google AI Studio account (for Gemini API)
4. GitHub repository connected to Netlify

## 🛠️ Step 1: Backend Deployment

### Option A: Render (Recommended)

1. **Go to Render.com**
   - Sign up/Login at https://render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `typapp-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. **Environment Variables**
   Add these in the Render dashboard:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-3 minutes)
   - Copy the URL (e.g., `https://typapp-backend.onrender.com`)

### Option B: Railway

1. **Go to Railway.app**
   - Sign up/Login at https://railway.app
   - Click "New Project"

2. **Connect Repository**
   - Connect your GitHub repository
   - Set root directory to `server`

3. **Environment Variables**
   Add the same environment variables as above

4. **Deploy**
   - Railway will auto-deploy
   - Copy the generated URL

### Option C: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-typapp-backend
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   heroku config:set GEMINI_API_KEY=your_gemini_api_key_here
   heroku config:set NODE_ENV=production
   ```

## 🔧 Step 2: Update Frontend Configuration

### Update netlify.toml

Replace the placeholder URLs with your actual backend URL:

```toml
# Redirect all API calls to the backend
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"
  status = 200
  force = true

# Headers for security and performance
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-backend-url.onrender.com;"

# Environment variables
[context.production.environment]
  REACT_APP_API_URL = "https://your-backend-url.onrender.com"
  REACT_APP_GEMINI_API_KEY = "your_gemini_api_key_here"
```

### Update Netlify Environment Variables

1. Go to your Netlify dashboard
2. Navigate to Site settings → Environment variables
3. Add/Update:
   - `REACT_APP_API_URL`: Your backend URL
   - `REACT_APP_GEMINI_API_KEY`: Your Gemini API key

## 🔑 Step 3: API Keys Setup

### Google Drive API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create a Service Account
5. Download the JSON key file
6. Upload it to your backend deployment

### Gemini AI API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

## 🧪 Step 4: Testing

1. **Test Backend Health**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"Typapp server is running"}`

2. **Test Frontend Connection**
   - Visit your Netlify site
   - Check browser console for CORS errors
   - The "Disconnected" status should change to "Connected"

3. **Test File Upload**
   - Try uploading a document
   - Check if analysis works

## 🔍 Troubleshooting

### CORS Issues
- Make sure your backend URL is correct in `netlify.toml`
- Verify CORS is properly configured in `server/index.js`
- Check that your backend is actually running

### Google Drive Issues
- Verify service account key is uploaded
- Check Google Drive API is enabled
- Ensure proper permissions

### File Upload Issues
- Check file size limits (10MB)
- Verify file types are supported
- Check backend logs for errors

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend deployment logs
3. Verify all environment variables are set
4. Test API endpoints individually

## 🎉 Success Indicators

- ✅ Frontend shows "Connected" status
- ✅ No CORS errors in browser console
- ✅ File upload works
- ✅ Google Drive integration works
- ✅ Document analysis works

---

**Need help?** Check the logs in your deployment platform's dashboard for specific error messages. 