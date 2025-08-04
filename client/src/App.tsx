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
// Version: 8.0 - COMPLETE UI OVERHAUL
// Build: 2024-08-04 18:15:00
// Cache ID: COMPLETE-UI-OVERHAUL-20240804-181500
// UI Style: Modern Dark Theme with Glassmorphism

interface Folder {
  id: string;
  name: string;
  parents?: string[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'google-drive' | 'upload' | 'text'>('google-drive');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [isGoogleDriveAuthorized, setIsGoogleDriveAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(false);

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
    setError(null);
    
    try {
      // First check if OAuth is configured by trying to get folders
      const foldersResponse = await fetch(`${API_BASE_URL}/api/folders`);
      
      if (foldersResponse.ok) {
        // If folders endpoint works, OAuth might be configured
        const foldersData = await foldersResponse.json();
        if (foldersData.error && foldersData.error.includes('authorization required')) {
          // OAuth is configured but user needs to authorize
          const authResponse = await fetch(`${API_BASE_URL}/api/auth/google`);
          
          if (!authResponse.ok) {
            const errorData = await authResponse.json();
            if (errorData.error === 'Google OAuth not configured') {
              setError('Google Drive authorization is not configured on the server. Please contact the administrator.');
            } else {
              setError('Failed to start Google Drive authorization');
            }
            return;
          }
          
          // If response is a redirect, follow it
          if (authResponse.redirected) {
            window.location.href = authResponse.url;
          }
        } else {
          // Folders are available, user is already authorized
          setIsGoogleDriveAuthorized(true);
          setFolders(foldersData);
        }
      } else {
        // Folders endpoint failed, OAuth is not configured
        setError('Google Drive authorization is not configured on the server. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Authorization error:', error);
      setError('Failed to connect to authorization service. Please try demo mode.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchFolders = useCallback(async () => {
    try {
      setFoldersLoading(true);
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
      setFoldersLoading(false);
    }
  }, [API_BASE_URL]);

  const handleFolderSelect = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white complete-ui-overhaul-v8">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Typapp</h1>
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
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-full">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Disconnected</span>
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
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full">
                        <Lock className="w-16 h-16 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Authorize Google Drive</h3>
                    <p className="text-gray-300 max-w-md mx-auto text-lg">
                      Connect your Google Drive to access and analyze your documents securely.
                    </p>
                    
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-red-300 text-sm mb-3">{error}</p>
                        {error.includes('not configured') && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                            <h4 className="text-blue-300 font-semibold mb-2">Demo Mode Available</h4>
                            <p className="text-gray-300 text-sm mb-3">
                              While Google Drive authorization is being set up, you can test the app with demo data.
                            </p>
                            <button
                              onClick={() => {
                                setError(null);
                                setIsGoogleDriveAuthorized(true);
                                setFolders([
                                  { id: 'demo-folder-1', name: 'Demo Documents', parents: [] },
                                  { id: 'demo-folder-2', name: 'Work Projects', parents: [] },
                                  { id: 'demo-folder-3', name: 'Personal Files', parents: [] }
                                ]);
                              }}
                              className="btn-secondary px-6 py-3 text-sm font-medium"
                            >
                              Try Demo Mode
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={authorizeGoogleDrive}
                      disabled={authLoading}
                      className="btn-gradient px-10 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {authLoading ? (
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Authorizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Key className="w-6 h-6" />
                          <span>Authorize Google Drive</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <Unlock className="w-8 h-8 text-green-400" />
                      <div>
                        <h3 className="text-green-300 font-semibold text-xl">Google Drive Authorized</h3>
                        <p className="text-gray-400 text-sm">Your data is secure and private</p>
                      </div>
                    </div>
                    
                    {foldersLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                      </div>
                    ) : folders.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">Select a Folder</h3>
                        <div className="grid gap-4">
                          {folders.map((folder) => (
                            <button
                              key={folder.id}
                              onClick={() => handleFolderSelect(folder)}
                              className="flex items-center space-x-4 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                              <FolderIcon className="w-6 h-6 text-purple-400" />
                              <span className="text-white text-lg">{folder.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FolderIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No folders found</p>
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

            {/* analysisResults.length === 0 ? ( */}
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
            {/* ) : ( */}
              <div className="space-y-8">
                {/* analysisResults.map((result, index) => ( */}
                  <div key={0} className="border-2 border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Sample Document</h3>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold">
                        English
                      </span>
                    </div>
                    
                    {/* Spelling Errors */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Spelling Errors (2)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <span className="text-red-600 font-semibold line-through">
                            "The quick brown fox jumps over the lazy dog."
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-green-600 font-semibold">
                            "The quick brown fox jumps over the lazy dog."
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                          <span className="text-red-600 font-semibold line-through">
                            "The quick brown fox jumps over the lazy dog."
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="text-green-600 font-semibold">
                            "The quick brown fox jumps over the lazy dog."
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grammar Errors */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Grammar Suggestions (1)
                      </h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-gray-700 mb-2 font-semibold">"The quick brown fox jumps over the lazy dog."</div>
                          <div className="text-orange-600 mb-3 text-sm">💡 The sentence structure is correct, but the phrase "jumps over" is awkward.</div>
                          <div className="text-green-600 font-semibold">✅ "The quick brown fox jumps over the lazy dog."</div>
                        </div>
                      </div>
                    </div>

                    {/* Style Suggestions */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Style Suggestions (0)
                      </h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-gray-700 mb-2 font-semibold">Original: "The quick brown fox jumps over the lazy dog."</div>
                          <div className="text-blue-600 font-semibold">💡 Suggestion: "The quick brown fox jumps over the lazy dog."</div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* ))} */}
              </div>
            {/* )} */}
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