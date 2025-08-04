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

// Force redeploy - 2024-08-04 16:30:00
// UI Version: 2.0 - Modern Glassmorphism Design
// Cache bust: v2.0.1

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
      } else {
        setError('Failed to fetch folders. Please check your Google Drive connection.');
      }
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchDocuments = useCallback(async (folderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/folder/${folderId}/documents`);
      setDocuments(response.data);
      if (response.data.length === 0) {
        setError('No documents found in this folder.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Folder not found or access denied.');
      } else {
        setError('Failed to fetch documents from the selected folder.');
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (isConnected) {
      fetchFolders();
    }
  }, [isConnected, fetchFolders]);

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    }
  }, [selectedFolder, fetchDocuments]);

  const handleDocumentToggle = useCallback((document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.find(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  }, []);

  const analyzeDocuments = useCallback(async () => {
    if (selectedDocuments.length === 0) {
      setError('Please select at least one document to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch content for all selected documents
      const documentContents: DocumentContent[] = [];
      for (const doc of selectedDocuments) {
        const response = await axios.get(`${API_BASE_URL}/api/document/${doc.id}`);
        documentContents.push(response.data);
      }

      // Analyze documents
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        documents: documentContents
      });

      setAnalysisResults(response.data.results);
    } catch (err) {
      setError('Failed to analyze documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDocuments, API_BASE_URL]);

  const handleRetry = () => {
    if (activeTab === 'drive') {
      fetchFolders();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-8">
            <Sparkles className="text-white" size={40} />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Typapp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional document analysis and content editing powered by AI
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold shadow-lg ${
            isConnected 
              ? 'bg-green-100 text-green-800 border-2 border-green-200' 
              : 'bg-red-100 text-red-800 border-2 border-red-200'
          }`}>
            {connectionLoading ? (
              <Loader2 className="animate-spin mr-3" size={18} />
            ) : isConnected ? (
              <Wifi className="mr-3" size={18} />
            ) : (
              <WifiOff className="mr-3" size={18} />
            )}
            {connectionLoading ? 'Checking connection...' : isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-4 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-lg mb-3">Connection Issue</h3>
                  <p className="text-red-700 mb-6 text-base">{error}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                    >
                      <RefreshCw className="mr-2" size={18} />
                      Retry
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-6 py-3 text-red-600 hover:text-red-700 transition-colors font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/30">
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('drive')}
                className={`px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center ${
                  activeTab === 'drive'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                }`}
              >
                <FolderIcon className="mr-3" size={20} />
                Google Drive
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                }`}
              >
                <Upload className="mr-3" size={20} />
                File Upload
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center ${
                  activeTab === 'text'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                }`}
              >
                <Edit3 className="mr-3" size={20} />
                Text Input
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {/* Left Panel - Content Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-10">
            {activeTab === 'drive' && (
              <>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FolderIcon className="mr-4 text-blue-600" size={32} />
                    Google Drive
                  </h2>
                  <div className="flex items-center space-x-3">
                    <Shield className="text-green-500" size={24} />
                    <span className="text-sm font-semibold text-gray-600">Secure</span>
                  </div>
                </div>

                {/* Folder Selection */}
                <div className="mb-10">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Choose a folder:
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200 text-base font-medium"
                      onChange={(e) => {
                        const folder = folders.find(f => f.id === e.target.value);
                        setSelectedFolder(folder || null);
                      }}
                      value={selectedFolder?.id || ''}
                      disabled={loading || !isConnected}
                    >
                      <option value="">Select a folder...</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    {loading && (
                      <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents List */}
                {selectedFolder && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                      <FileText className="mr-4 text-green-600" size={26} />
                      Documents in "{selectedFolder.name}"
                    </h3>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <Loader2 className="animate-spin text-blue-600 mx-auto mb-6" size={40} />
                          <p className="text-gray-600 text-lg font-medium">Loading documents...</p>
                        </div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-16">
                        <FileText className="mx-auto mb-6 text-gray-400" size={60} />
                        <p className="text-gray-500 text-lg font-medium">No documents found in this folder</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {documents.map(doc => (
                          <label
                            key={doc.id}
                            className="flex items-center p-5 border-2 border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDocuments.some(d => d.id === doc.id)}
                              onChange={() => handleDocumentToggle(doc)}
                              className="mr-5 h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">
                                {doc.name}
                              </div>
                              <div className="text-gray-500 font-medium">
                                Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <CheckCircle className="text-blue-600" size={24} />
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                {/* Analyze Button */}
                {selectedDocuments.length > 0 && (
                  <button
                    onClick={analyzeDocuments}
                    disabled={loading}
                    className="mt-10 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-4" size={28} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-4" size={28} />
                        Analyze {selectedDocuments.length} Document{selectedDocuments.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
              </>
            )}

            {activeTab === 'upload' && (
              <FileUploader />
            )}

            {activeTab === 'text' && (
              <DemoAnalyzer />
            )}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-10">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="mr-4 text-green-600" size={32} />
                Analysis Results
              </h2>
              <Globe className="text-blue-500" size={28} />
            </div>

            {analysisResults.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FileText className="text-blue-600" size={50} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Analyze</h3>
                <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
                  Select documents and click analyze to see detailed results with spelling, grammar, and style suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {analysisResults.map((result, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-2xl p-8 bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        {result.documentTitle}
                      </h3>
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {result.language}
                      </span>
                    </div>

                    {/* Spelling Errors */}
                    {result.spellingErrors.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-bold text-red-700 mb-4 flex items-center text-lg">
                          <AlertCircle className="mr-3" size={22} />
                          Spelling Errors ({result.spellingErrors.length})
                        </h4>
                        <div className="space-y-3">
                          {result.spellingErrors.map((error, idx) => (
                            <div key={idx} className="flex items-center p-4 bg-red-50 rounded-xl border border-red-100">
                              <span className="text-red-600 font-bold">{error.original}</span>
                              <span className="mx-3 text-gray-400 text-xl">→</span>
                              <span className="text-green-600 font-bold">{error.corrected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {result.grammarErrors.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-bold text-orange-700 mb-4 flex items-center text-lg">
                          <AlertCircle className="mr-3" size={22} />
                          Grammar Errors ({result.grammarErrors.length})
                        </h4>
                        <div className="space-y-5">
                          {result.grammarErrors.map((error, idx) => (
                            <div key={idx} className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                              <div className="text-gray-700 mb-3 font-bold">"{error.original}"</div>
                              <div className="text-orange-600 mb-3 text-base">✖ {error.explanation}</div>
                              <div className="text-green-600 font-bold">✔ "{error.corrected}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {result.styleSuggestions.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-bold text-blue-700 mb-4 flex items-center text-lg">
                          <Sparkles className="mr-3" size={22} />
                          Style Suggestions ({result.styleSuggestions.length})
                        </h4>
                        <div className="space-y-5">
                          {result.styleSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                              <div className="text-gray-700 mb-3 font-bold">Original: "{suggestion.original}"</div>
                              <div className="text-blue-600 font-bold">Suggestion: "{suggestion.suggestion}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.spellingErrors.length === 0 && 
                     result.grammarErrors.length === 0 && 
                     result.styleSuggestions.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="text-green-600" size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-green-700 mb-3">Perfect Document!</h4>
                        <p className="text-green-600 text-lg font-medium">No issues found. Your document looks great!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 text-gray-500">
          <p className="flex items-center justify-center text-lg font-medium">
            <Shield className="mr-3" size={20} />
            Secure • Private • Professional
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 