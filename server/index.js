const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Google Drive API setup
const drive = google.drive('v3');
const docs = google.docs('v1');

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
  ]
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Typopp server is running' });
});

// Get Google Drive folders
app.get('/api/folders', async (req, res) => {
  try {
    const authClient = await auth.getClient();
    
    const response = await drive.files.list({
      auth: authClient,
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, parents)',
      orderBy: 'name'
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get documents from a specific folder
app.get('/api/folder/:folderId/documents', async (req, res) => {
  try {
    const { folderId } = req.params;
    const authClient = await auth.getClient();
    
    const response = await drive.files.list({
      auth: authClient,
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc'
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document content
app.get('/api/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const authClient = await auth.getClient();
    
    const response = await docs.documents.get({
      auth: authClient,
      documentId: documentId
    });

    // Extract text content from the document
    const content = extractTextFromDocument(response.data);
    
    res.json({
      id: documentId,
      title: response.data.title,
      content: content,
      lastModified: response.data.revisionId
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document content' });
  }
});

// Analyze document content
app.post('/api/analyze', async (req, res) => {
  try {
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const analysisResults = [];
    
    for (const doc of documents) {
      const analysis = await analyzeDocument(doc);
      analysisResults.push(analysis);
    }

    res.json({ results: analysisResults });
  } catch (error) {
    console.error('Error analyzing documents:', error);
    res.status(500).json({ error: 'Failed to analyze documents' });
  }
});

// Demo endpoint for testing analysis without Google Drive
app.post('/api/analyze-demo', async (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content || !title) {
      return res.status(400).json({ error: 'Content and title are required' });
    }

    const analysis = await analyzeDocument({ title, content });
    res.json({ results: [analysis] });
  } catch (error) {
    console.error('Error analyzing demo document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Helper function to extract text from Google Doc
function extractTextFromDocument(document) {
  let text = '';
  
  if (document.body && document.body.content) {
    document.body.content.forEach(element => {
      if (element.paragraph) {
        element.paragraph.elements.forEach(paraElement => {
          if (paraElement.textRun) {
            text += paraElement.textRun.content;
          }
        });
        text += '\n';
      }
    });
  }
  
  return text.trim();
}

// Import the document analyzer
const DocumentAnalyzer = require('./services/documentAnalyzer');

// Initialize document analyzer
const documentAnalyzer = new DocumentAnalyzer();

// Helper function to analyze document content
async function analyzeDocument(document) {
  try {
    return await documentAnalyzer.analyzeDocument(document);
  } catch (error) {
    console.error('Error analyzing document:', error);
    // Return basic analysis if advanced analysis fails
    const { title, content } = document;
    const language = detectLanguage(content);
    
    return {
      documentTitle: title,
      language: language,
      spellingErrors: [],
      grammarErrors: [],
      styleSuggestions: []
    };
  }
}

// Simplified language detection
function detectLanguage(text) {
  const turkishPattern = /[çğıöşüÇĞIİÖŞÜ]/;
  const germanPattern = /[äöüßÄÖÜ]/;
  const frenchPattern = /[àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/;
  
  if (turkishPattern.test(text)) return 'Turkish';
  if (germanPattern.test(text)) return 'German';
  if (frenchPattern.test(text)) return 'French';
  return 'English';
}

app.listen(PORT, () => {
  console.log(`Typopp server running on port ${PORT}`);
}); 