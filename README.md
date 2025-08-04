# Typapp - Professional Document Analysis Tool

A modern web application that integrates with Google Drive to analyze and edit documents in multiple languages (Turkish, English, German, French). Typapp provides professional-grade spelling, grammar, and style corrections while preserving the original tone and intent of your documents.

## Features

- 🔍 **Google Drive Integration**: Seamlessly connect to your Google Drive and select folders
- 📄 **Multi-Language Support**: Analyze documents in Turkish, English, German, and French
- ✍️ **Professional Editing**: Detect and correct spelling mistakes, grammar errors, and syntax issues
- 🎨 **Style Suggestions**: Get optional style improvements for better readability
- 🎯 **Preserve Intent**: Maintain your original tone and meaning while fixing technical issues
- 📱 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- ⚡ **Real-time Analysis**: Fast document processing with immediate results

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, Google APIs
- **AI Integration**: Google Gemini AI for advanced document analysis
- **Authentication**: Google Service Account
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Netlify (Frontend), Railway/Render (Backend)

## Prerequisites

Before running Typapp, you'll need:

1. **Node.js** (v16 or higher)
2. **Google Cloud Project** with Drive API enabled
3. **Google Service Account** with appropriate permissions
4. **Google Gemini AI API Key** (optional, for enhanced analysis)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Typapp
npm run install-all
```

### 2. Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API and Google Docs API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "typapp-service")
   - Grant "Editor" role
5. Create and download a JSON key file
6. Place the key file in the `server/` directory as `service-account-key.json`

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./server/service-account-key.json
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

### 4. Share Google Drive Folders

For the service account to access your Google Drive folders:

1. Open the folder you want to analyze in Google Drive
2. Click "Share" and add your service account email (found in the JSON key file)
3. Grant "Viewer" permissions

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Build

```bash
npm run build
npm start
```

## Netlify Deployment

### Frontend Deployment

1. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub repository: `https://github.com/yusufozbay/typapp`

2. **Configure Build Settings**:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`

3. **Set Environment Variables**:
   In Netlify dashboard → Site settings → Environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Deploy**: Click "Deploy site"

### Backend Deployment

Deploy the backend to Railway, Render, or Heroku:

1. **Railway** (Recommended):
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Add environment variables:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     GOOGLE_APPLICATION_CREDENTIALS=your_service_account_json_content
     ```

2. **Update Frontend API URL**:
   - Copy your backend URL from Railway
   - Update `REACT_APP_API_URL` in Netlify environment variables

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000`
2. **Select a Folder**: Choose a Google Drive folder from the dropdown
3. **Select Documents**: Check the documents you want to analyze
4. **Analyze**: Click "Analyze Documents" to start the process
5. **Review Results**: View spelling errors, grammar corrections, and style suggestions

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/folders` - Get all Google Drive folders
- `GET /api/folder/:folderId/documents` - Get documents in a specific folder
- `GET /api/document/:documentId` - Get document content
- `POST /api/analyze` - Analyze selected documents

## Analysis Output Format

The application provides analysis results in the following format:

```
---
Document Title: [Document Name]
Language: [Detected Language]

### Spelling Errors
- [incorrect_word] → [corrected_word]

### Grammar Errors
1. "[original_sentence]"
   ✖ [explanation_of_error]
   ✔ [corrected_sentence]

### Style Suggestions (Optional)
- Original: "[original_text]"
  Suggestion: "[improved_version]"
---
```

## Supported Languages

- **Turkish**: Full support for Turkish grammar and spelling
- **English**: Comprehensive English language analysis
- **German**: German grammar and spelling correction
- **French**: French language support with accent handling

## Security Features

- Rate limiting to prevent abuse
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Secure Google API authentication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common setup issues
- Ensure your Google Cloud project has the necessary APIs enabled

## Roadmap

- [ ] Support for additional languages
- [ ] Batch processing for large document sets
- [ ] Export analysis results to PDF
- [ ] Integration with Google Docs for direct editing
- [ ] Advanced style analysis and suggestions
- [ ] User authentication and document history 