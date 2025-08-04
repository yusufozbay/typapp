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
  Globe
} from 'lucide-react';
import DemoAnalyzer from './components/DemoAnalyzer';
import FileUploader from './components/FileUploader';
import './App.css';

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Typapp
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Professional document analysis and content editing powered by AI
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {connectionLoading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : isConnected ? (
              <CheckCircle className="mr-2" size={16} />
            ) : (
              <AlertCircle className="mr-2" size={16} />
            )}
            {connectionLoading ? 'Checking connection...' : isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-3 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="text-red-800 font-medium mb-2">Connection Issue</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="mr-2" size={16} />
                      Retry
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('drive')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === 'drive'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <FolderIcon className="mr-2" size={18} />
                Google Drive
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Upload className="mr-2" size={18} />
                File Upload
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  activeTab === 'text'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Edit3 className="mr-2" size={18} />
                Text Input
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Content Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {activeTab === 'drive' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FolderIcon className="mr-3 text-blue-600" size={28} />
                    Google Drive
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Shield className="text-green-500" size={20} />
                    <span className="text-sm text-gray-600">Secure</span>
                  </div>
                </div>

                {/* Folder Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose a folder:
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="animate-spin text-blue-600" size={20} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents List */}
                {selectedFolder && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FileText className="mr-3 text-green-600" size={22} />
                      Documents in "{selectedFolder.name}"
                    </h3>
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                          <p className="text-gray-600">Loading documents...</p>
                        </div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No documents found in this folder</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                        {documents.map(doc => (
                          <label
                            key={doc.id}
                            className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDocuments.some(d => d.id === doc.id)}
                              onChange={() => handleDocumentToggle(doc)}
                              className="mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                {doc.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <CheckCircle className="text-blue-600" size={20} />
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
                    className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-3" size={24} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3" size={24} />
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="mr-3 text-green-600" size={28} />
                Analysis Results
              </h2>
              <Globe className="text-blue-500" size={24} />
            </div>

            {analysisResults.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="text-blue-600" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Select documents and click analyze to see detailed results with spelling, grammar, and style suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {analysisResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {result.documentTitle}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {result.language}
                      </span>
                    </div>

                    {/* Spelling Errors */}
                    {result.spellingErrors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                          <AlertCircle className="mr-2" size={18} />
                          Spelling Errors ({result.spellingErrors.length})
                        </h4>
                        <div className="space-y-2">
                          {result.spellingErrors.map((error, idx) => (
                            <div key={idx} className="flex items-center p-3 bg-red-50 rounded-lg">
                              <span className="text-red-600 font-medium">{error.original}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="text-green-600 font-medium">{error.corrected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {result.grammarErrors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                          <AlertCircle className="mr-2" size={18} />
                          Grammar Errors ({result.grammarErrors.length})
                        </h4>
                        <div className="space-y-4">
                          {result.grammarErrors.map((error, idx) => (
                            <div key={idx} className="p-4 bg-orange-50 rounded-lg">
                              <div className="text-gray-700 mb-2 font-medium">"{error.original}"</div>
                              <div className="text-orange-600 mb-2 text-sm">✖ {error.explanation}</div>
                              <div className="text-green-600 font-medium">✔ "{error.corrected}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {result.styleSuggestions.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                          <Sparkles className="mr-2" size={18} />
                          Style Suggestions ({result.styleSuggestions.length})
                        </h4>
                        <div className="space-y-4">
                          {result.styleSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                              <div className="text-gray-700 mb-2 font-medium">Original: "{suggestion.original}"</div>
                              <div className="text-blue-600 font-medium">Suggestion: "{suggestion.suggestion}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.spellingErrors.length === 0 && 
                     result.grammarErrors.length === 0 && 
                     result.styleSuggestions.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Perfect Document!</h4>
                        <p className="text-green-600">No issues found. Your document looks great!</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="flex items-center justify-center">
            <Shield className="mr-2" size={16} />
            Secure • Private • Professional
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 