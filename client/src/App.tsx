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
import Card from './components/Card';
import Banner from './components/Banner';
import Loader from './components/Loader';
import './App.css';

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
      const foldersResponse = await fetch(`${API_BASE_URL}/api/folders`);
      
      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json();
        if (foldersData.error && foldersData.error.includes('authorization required')) {
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
          
          if (authResponse.redirected) {
            window.location.href = authResponse.url;
          }
        } else {
          setIsGoogleDriveAuthorized(true);
          setFolders(foldersData);
        }
      } else {
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
    if (isGoogleDriveAuthorized) {
      fetchFolders();
    }
  }, [isGoogleDriveAuthorized, fetchFolders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Typapp</h1>
                <p className="text-gray-600 text-sm">Professional document analysis powered by AI</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              {connectionLoading ? (
  <Loader className="text-blue-600" />
) : isConnected ? (
  <Banner type="success" message="Connected" />
) : (
  <Banner type="error" message="Disconnected" onClose={handleRetry} />
)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('google-drive')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 text-sm font-medium transition-all duration-200 rounded-md ${
                activeTab === 'google-drive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FolderIcon className="w-4 h-4" />
              <span>Google Drive</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 text-sm font-medium transition-all duration-200 rounded-md ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 text-sm font-medium transition-all duration-200 rounded-md ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Text Input</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Google Drive Tab */}
            {activeTab === 'google-drive' && (
              <div className="space-y-6">
                {!isGoogleDriveAuthorized ? (
  <Card className="text-center">
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-blue-600" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Authorize Google Drive</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Connect your Google Drive to access and analyze your documents securely.
    </p>
    {error && (
      <Banner type="error" message={error} onClose={() => setError(null)} />
    )}
    <button
      onClick={authorizeGoogleDrive}
      disabled={authLoading}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {authLoading ? <Loader /> : <><Key className="w-5 h-5" /> <span>Authorize Google Drive</span></>}
    </button>
  </Card>
) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Unlock className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="text-green-800 font-medium">Google Drive Authorized</h3>
                          <p className="text-green-700 text-sm">Your data is secure and private</p>
                        </div>
                      </div>
                    </div>
                    
                    {foldersLoading ? (
                      <Loader />
                    ) : folders.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Select a Folder</h3>
                        <div className="space-y-3">
                          {folders.map((folder) => (
                            <button
                              key={folder.id}
                              onClick={() => handleFolderSelect(folder)}
                              className="w-full flex items-center space-x-3 p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                            >
                              <FolderIcon className="w-5 h-5 text-blue-600" />
                              <span className="text-gray-900">{folder.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No folders found</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>

            {error && (
  <Banner type="error" message={error} onClose={handleRetry} />
)}

            <div className="text-center py-12">
              <div className="flex justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to Analyze</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Select documents and click analyze to see detailed results with spelling, grammar, and style suggestions.
              </p>
            </div>

            {/* Sample Results */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sample Document</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    English
                  </span>
                </div>
                
                {/* Spelling Errors */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-red-700 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Spelling Errors (2)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 bg-red-50 rounded border border-red-200">
                      <span className="text-red-600 line-through text-sm">
                        "The quick brown fox jumps over the lazy dog."
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-green-600 font-medium text-sm">
                        "The quick brown fox jumps over the lazy dog."
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-red-50 rounded border border-red-200">
                      <span className="text-red-600 line-through text-sm">
                        "The quick brown fox jumps over the lazy dog."
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-green-600 font-medium text-sm">
                        "The quick brown fox jumps over the lazy dog."
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grammar Suggestions */}
                <div>
                  <h4 className="text-md font-semibold text-orange-700 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Grammar Suggestions (1)
                  </h4>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <div className="text-gray-700 mb-2 text-sm">"The quick brown fox jumps over the lazy dog."</div>
                    <div className="text-orange-600 mb-2 text-sm">💡 The sentence structure is correct, but the phrase "jumps over" is awkward.</div>
                    <div className="text-green-600 font-medium text-sm">✅ "The quick brown fox jumps over the lazy dog."</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-4 h-4" />
              <span className="font-medium text-sm">Secure • Private • Professional</span>
            </div>
            <div className="text-gray-500 text-sm">
              Powered by AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 