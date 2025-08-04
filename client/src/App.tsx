import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Folder as FolderIcon, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Edit3, 
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import DemoAnalyzer from './components/DemoAnalyzer';
import FileUploader from './components/FileUploader';
import './App.css';

// Clean UI Design - Professional & Modern
// Version: 3.0 - Clean Design

interface Folder {
  id: string;
  name: string;
  parents?: string[];
}

interface Document {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
}

interface DocumentContent {
  id: string;
  title: string;
  content: string;
  lastModified: string;
}

interface AnalysisResult {
  documentTitle: string;
  language: string;
  spellingErrors: Array<{ original: string; corrected: string }>;
  grammarErrors: Array<{
    original: string;
    explanation: string;
    corrected: string;
  }>;
  styleSuggestions: Array<{
    original: string;
    suggestion: string;
  }>;
}

function App() {
  const [activeTab, setActiveTab] = useState<'drive' | 'upload' | 'text'>('drive');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const checkConnection = useCallback(async () => {
    try {
      setConnectionLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setIsConnected(response.data.status === 'ok');
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setConnectionLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/folders`);
      setFolders(response.data);
      if (response.data.length === 0) {
        setError('No folders found. Please check your Google Drive permissions or try refreshing.');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Google Drive authentication required. Please sign in to your Google account.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your Google Drive permissions.');
      } else if (err.response?.status === 404) {
        setError('Google Drive service not found. Please try again later.');
      } else {
        setError('Failed to fetch folders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchDocuments = useCallback(async (folderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/documents/${folderId}`);
      setDocuments(response.data);
      if (response.data.length === 0) {
        setError('No documents found in this folder.');
      }
    } catch (err: any) {
      setError('Failed to fetch documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const analyzeDocuments = useCallback(async () => {
    if (selectedDocuments.length === 0) {
      setError('Please select at least one document to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        documents: selectedDocuments
      });
      setAnalysisResults(response.data);
    } catch (err: any) {
      setError('Failed to analyze documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDocuments, API_BASE_URL]);

  const handleDocumentToggle = useCallback((document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.find(d => d.id === document.id);
      if (isSelected) {
        return prev.filter(d => d.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  }, []);

  const handleRetry = () => {
    setError(null);
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    } else {
      fetchFolders();
    }
  };

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    }
  }, [selectedFolder, fetchDocuments]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Typapp</h1>
                <p className="text-gray-600">Professional document analysis powered by AI</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionLoading ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'drive'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderIcon className="w-5 h-5" />
              <span>Google Drive</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-5 h-5" />
              <span>Text Input</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {activeTab === 'drive' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FolderIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Google Drive</h2>
                  <Shield className="w-5 h-5 text-green-600" />
                </div>

                {/* Folder Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a folder:
                  </label>
                  <select
                    value={selectedFolder?.id || ''}
                    onChange={(e) => {
                      const folder = folders.find(f => f.id === e.target.value);
                      setSelectedFolder(folder || null);
                      setDocuments([]);
                      setSelectedDocuments([]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a folder...</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Documents List */}
                {selectedFolder && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Documents</h3>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    ) : documents.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {documents.map((doc) => (
                          <label key={doc.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.some(d => d.id === doc.id)}
                              onChange={() => handleDocumentToggle(doc)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <FileText className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-700">{doc.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No documents found</p>
                    )}
                  </div>
                )}

                {/* Analyze Button */}
                {selectedDocuments.length > 0 && (
                  <button
                    onClick={analyzeDocuments}
                    disabled={loading}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Analyze Documents</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'upload' && <FileUploader />}
            {activeTab === 'text' && <DemoAnalyzer />}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {analysisResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center space-x-4 mb-4">
                  <Globe className="w-12 h-12 text-gray-300" />
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600">
                  Select documents and click analyze to see detailed results with spelling, grammar, and style suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {analysisResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{result.documentTitle}</h3>
                    
                    {/* Language */}
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Language: </span>
                      <span className="text-sm text-gray-600">{result.language}</span>
                    </div>

                    {/* Spelling Errors */}
                    {result.spellingErrors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Spelling Errors</h4>
                        <div className="space-y-2">
                          {result.spellingErrors.map((error, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-red-600 line-through">{error.original}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600 font-medium">{error.corrected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {result.grammarErrors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Grammar Suggestions</h4>
                        <div className="space-y-3">
                          {result.grammarErrors.map((error, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-red-600 mb-1">{error.original}</div>
                              <div className="text-gray-600 mb-1">{error.explanation}</div>
                              <div className="text-green-600 font-medium">{error.corrected}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {result.styleSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Style Suggestions</h4>
                        <div className="space-y-2">
                          {result.styleSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-gray-600 mb-1">{suggestion.original}</div>
                              <div className="text-blue-600 font-medium">{suggestion.suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Secure • Private • Professional</span>
            </div>
            <div className="text-sm text-gray-500">
              Powered by AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 