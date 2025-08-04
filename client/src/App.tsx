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
  Shield,
  Sparkles,
  Globe,
  Wifi,
  WifiOff,
  Star,
  ArrowRight,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import DemoAnalyzer from './components/DemoAnalyzer';
import FileUploader from './components/FileUploader';
import './App.css';

// Sleek Modern UI - Google Drive Auth Flow
// Version: 6.0 - Auth-First Design
// Build: 2024-08-04 17:30:00

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
  const [isGoogleDriveAuthorized, setIsGoogleDriveAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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

  const checkGoogleDriveAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/folders`);
      // If we get folders, user is authorized
      setIsGoogleDriveAuthorized(response.data.length > 0 || response.data.error === undefined);
      setFolders(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsGoogleDriveAuthorized(false);
      } else {
        setIsGoogleDriveAuthorized(false);
      }
    } finally {
      setAuthLoading(false);
    }
  }, [API_BASE_URL]);

  const authorizeGoogleDrive = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      // Redirect to Google OAuth
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    } catch (err) {
      setError('Failed to initiate Google Drive authorization.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchFolders = useCallback(async () => {
    if (!isGoogleDriveAuthorized) {
      return;
    }
    
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
        setIsGoogleDriveAuthorized(false);
        setError('Google Drive authorization required. Please authorize access.');
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
  }, [API_BASE_URL, isGoogleDriveAuthorized]);

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
    if (isConnected) {
      checkGoogleDriveAuth();
    }
  }, [isConnected, checkGoogleDriveAuth]);

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    }
  }, [selectedFolder, fetchDocuments]);

  useEffect(() => {
    if (isGoogleDriveAuthorized) {
      fetchFolders();
    }
  }, [isGoogleDriveAuthorized, fetchFolders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 force-new-ui-v6">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Typapp
                </h1>
                <p className="text-gray-600 font-medium">Professional document analysis powered by AI</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              {connectionLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Connecting...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-semibold">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-semibold">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-2 mb-12">
          <div className="flex">
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-8 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === 'drive'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <FolderIcon className="w-5 h-5" />
              <span>Google Drive</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-8 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-8 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Edit3 className="w-5 h-5" />
              <span>Text Input</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Panel */}
          <div className="space-y-8">
            {activeTab === 'drive' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Google Drive</h2>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Secure</span>
                  </div>
                </div>

                {/* Google Drive Authorization Status */}
                {!isGoogleDriveAuthorized ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Authorize Google Drive</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      To access your Google Drive folders and documents, you need to authorize Typapp to access your Google account.
                    </p>
                    <button
                      onClick={authorizeGoogleDrive}
                      disabled={authLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl"
                    >
                      {authLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Authorizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <Key className="w-6 h-6" />
                          <span>Authorize Google Drive</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                    <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Your data is secure and private</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Authorization Success */}
                    <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <Unlock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">Google Drive Authorized</h4>
                          <p className="text-green-600 text-sm">You can now access your folders and documents</p>
                        </div>
                      </div>
                    </div>

                    {/* Folder Selection */}
                    <div className="mb-8">
                      <label className="block text-lg font-semibold text-gray-900 mb-4">
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
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-base font-medium bg-white/50 backdrop-blur-sm"
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
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                          <FileText className="w-6 h-6 text-blue-600 mr-3" />
                          Documents
                        </h3>
                        {loading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          </div>
                        ) : documents.length > 0 ? (
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {documents.map((doc) => (
                              <label key={doc.id} className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-300 group">
                                <input
                                  type="checkbox"
                                  checked={selectedDocuments.some(d => d.id === doc.id)}
                                  onChange={() => handleDocumentToggle(doc)}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                                />
                                <FileText className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                <span className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{doc.name}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">No documents found</p>
                        )}
                      </div>
                    )}

                    {/* Analyze Button */}
                    {selectedDocuments.length > 0 && (
                      <button
                        onClick={analyzeDocuments}
                        disabled={loading}
                        className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-3">
                            <Sparkles className="w-6 h-6" />
                            <span>Analyze Documents</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'upload' && <FileUploader />}
            {activeTab === 'text' && <DemoAnalyzer />}
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-800 font-semibold">{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="mt-4 text-sm text-red-600 hover:text-red-800 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {analysisResults.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center space-x-6 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Analyze</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  Select documents and click analyze to see detailed results with spelling, grammar, and style suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {analysisResults.map((result, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{result.documentTitle}</h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold">
                        {result.language}
                      </span>
                    </div>
                    
                    {/* Spelling Errors */}
                    {result.spellingErrors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Spelling Errors ({result.spellingErrors.length})
                        </h4>
                        <div className="space-y-3">
                          {result.spellingErrors.map((error, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                              <span className="text-red-600 font-semibold line-through">{error.original}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-green-600 font-semibold">{error.corrected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {result.grammarErrors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Grammar Suggestions ({result.grammarErrors.length})
                        </h4>
                        <div className="space-y-4">
                          {result.grammarErrors.map((error, idx) => (
                            <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-gray-700 mb-2 font-semibold">"{error.original}"</div>
                              <div className="text-orange-600 mb-3 text-sm">💡 {error.explanation}</div>
                              <div className="text-green-600 font-semibold">✅ "{error.corrected}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {result.styleSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Style Suggestions ({result.styleSuggestions.length})
                        </h4>
                        <div className="space-y-4">
                          {result.styleSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-gray-700 mb-2 font-semibold">Original: "{suggestion.original}"</div>
                              <div className="text-blue-600 font-semibold">💡 Suggestion: "{suggestion.suggestion}"</div>
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
      <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-600">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Secure • Private • Professional</span>
            </div>
            <div className="text-gray-500 font-medium">
              Powered by AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 