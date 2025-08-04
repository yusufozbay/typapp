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
// Version: 7.0 - ULTIMATE CACHE BUST
// Build: 2024-08-04 18:00:00
// Cache ID: ULTIMATE-FORCE-NEW-UI-20240804-180000
// UI Style: Sleek Modern Glassmorphism with Auth Flow

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
  const [activeTab, setActiveTab] = useState<'google-drive' | 'upload' | 'text'>('google-drive');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
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
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Google OAuth not configured') {
          setError('Google Drive authorization is not configured on the server. Please contact the administrator.');
        } else {
          setError('Failed to start Google Drive authorization');
        }
        return;
      }
      
      // If response is a redirect, follow it
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        // Handle the case where we get a JSON response instead of a redirect
        const data = await response.json();
        if (data.error) {
          setError(data.message || 'Authorization failed');
        }
      }
    } catch (error) {
      console.error('Authorization error:', error);
      setError('Failed to connect to authorization service');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/folders`);
      setFolders(response.data);
    } catch (err: any) {
      console.error('Error fetching folders:', err);
      if (err.response?.status === 401) {
        setIsGoogleDriveAuthorized(false);
      } else {
        setError('Failed to fetch folders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const handleFolderSelect = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setSelectedDocuments([]);
    // Note: fetchDocuments would be called here when implemented
  }, []);

  const handleRetry = () => {
    setError(null);
    checkConnection();
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
      // fetchDocuments(selectedFolder.id); // This line was removed
    }
  }, [selectedFolder]); // Removed fetchDocuments from dependency array

  useEffect(() => {
    if (isGoogleDriveAuthorized) {
      fetchFolders();
    }
  }, [isGoogleDriveAuthorized, fetchFolders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white force-new-ui-v7">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Typapp</h1>
                <p className="text-gray-300 text-sm">Professional document analysis powered by AI</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              {connectionLoading ? (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Connecting...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-400">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm">Disconnected</span>
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
              onClick={() => setActiveTab('google-drive')}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 px-8 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === 'google-drive'
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
            {/* Google Drive Tab */}
            {activeTab === 'google-drive' && (
              <div className="space-y-6">
                {!isGoogleDriveAuthorized ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full">
                        <Lock className="w-12 h-12 text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Authorize Google Drive</h3>
                    <p className="text-gray-300 max-w-md mx-auto">
                      Connect your Google Drive to access and analyze your documents securely.
                    </p>
                    
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-300 text-sm">{error}</p>
                        {error.includes('not configured') && (
                          <p className="text-gray-400 text-xs mt-2">
                            Demo mode: You can still test the app with sample data below.
                          </p>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={authorizeGoogleDrive}
                      disabled={authLoading}
                      className="btn-gradient px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {authLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Authorizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Key className="w-5 h-5" />
                          <span>Authorize Google Drive</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Demo Mode Fallback */}
                    {error && error.includes('not configured') && (
                      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="text-blue-300 font-semibold mb-2">Demo Mode Available</h4>
                        <p className="text-gray-300 text-sm mb-3">
                          While Google Drive authorization is being set up, you can test the app with demo data.
                        </p>
                        <button
                          onClick={() => {
                            setError(null);
                            setIsGoogleDriveAuthorized(true);
                          }}
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Try Demo Mode
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Unlock className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-green-300 font-semibold">Google Drive Authorized</h3>
                        <p className="text-gray-400 text-sm">Your data is secure and private</p>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                      </div>
                    ) : folders.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Select a Folder</h3>
                        <div className="grid gap-3">
                          {folders.map((folder) => (
                            <button
                              key={folder.id}
                              onClick={() => handleFolderSelect(folder)}
                              className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 hover:scale-105"
                            >
                              <FolderIcon className="w-5 h-5 text-blue-400" />
                              <span className="text-white">{folder.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FolderIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No folders found</p>
                      </div>
                    )}
                  </div>
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