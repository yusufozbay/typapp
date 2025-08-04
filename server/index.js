const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://typapp.netlify.app',
    'https://your-typapp.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'), false);
    }
  }
});

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
  res.json({ status: 'OK', message: 'Typapp server is running' });
});

// Get Google Drive folders
app.get('/api/folders', async (req, res) => {
  try {
    // Check if Google credentials are available
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Google credentials not configured, returning demo data');
      // Return demo folders for testing
      return res.json([
        { id: 'demo-folder-1', name: 'Demo Documents', parents: [] },
        { id: 'demo-folder-2', name: 'Work Projects', parents: [] },
        { id: 'demo-folder-3', name: 'Personal Files', parents: [] }
      ]);
    }

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
    
    // Return demo data if Google API fails
    if (error.code === 'ENOENT' || error.message.includes('credentials')) {
      console.log('Google credentials not found, returning demo data');
      return res.json([
        { id: 'demo-folder-1', name: 'Demo Documents', parents: [] },
        { id: 'demo-folder-2', name: 'Work Projects', parents: [] },
        { id: 'demo-folder-3', name: 'Personal Files', parents: [] }
      ]);
    }
    
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get documents from a specific folder
app.get('/api/documents/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    
    // Check if Google credentials are available
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Google credentials not configured, returning demo documents');
      // Return demo documents for testing
      return res.json([
        { id: 'demo-doc-1', name: 'Sample Document 1.docx', createdTime: '2024-08-04T10:00:00Z', modifiedTime: '2024-08-04T10:00:00Z' },
        { id: 'demo-doc-2', name: 'Project Report.pdf', createdTime: '2024-08-04T09:00:00Z', modifiedTime: '2024-08-04T09:00:00Z' },
        { id: 'demo-doc-3', name: 'Meeting Notes.txt', createdTime: '2024-08-04T08:00:00Z', modifiedTime: '2024-08-04T08:00:00Z' }
      ]);
    }

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
    
    // Return demo data if Google API fails
    if (error.code === 'ENOENT' || error.message.includes('credentials')) {
      console.log('Google credentials not found, returning demo documents');
      return res.json([
        { id: 'demo-doc-1', name: 'Sample Document 1.docx', createdTime: '2024-08-04T10:00:00Z', modifiedTime: '2024-08-04T10:00:00Z' },
        { id: 'demo-doc-2', name: 'Project Report.pdf', createdTime: '2024-08-04T09:00:00Z', modifiedTime: '2024-08-04T09:00:00Z' },
        { id: 'demo-doc-3', name: 'Meeting Notes.txt', createdTime: '2024-08-04T08:00:00Z', modifiedTime: '2024-08-04T08:00:00Z' }
      ]);
    }
    
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

// File upload endpoint
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    let content = '';

    // Extract text based on file type
    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else if (fileType === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else if (fileType === 'text/plain') {
      content = fs.readFileSync(filePath, 'utf8');
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (!content.trim()) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    // Analyze the extracted content
    const analysis = await analyzeDocument({ 
      title: fileName, 
      content: content 
    });

    res.json({ results: [analysis] });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});

// Error handler for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
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
  console.log(`Typapp server running on port ${PORT}`);
}); 