import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import DemoAnalyzer from './components/DemoAnalyzer';
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
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id);
    }
  }, [selectedFolder]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/folders`);
      setFolders(response.data);
    } catch (err) {
      setError('Failed to fetch folders. Please check your Google Drive connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (folderId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/folder/${folderId}/documents`);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents from the selected folder.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentToggle = (document: Document) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.find(doc => doc.id === document.id);
      if (isSelected) {
        return prev.filter(doc => doc.id !== document.id);
      } else {
        return [...prev, document];
      }
    });
  };

  const analyzeDocuments = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="text-blue-600">Typ</span>app
          </h1>
          <p className="text-gray-600 text-lg">
            Professional document analysis and content editing
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Folder and Document Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Folder className="mr-2 text-blue-600" size={24} />
              Select Google Drive Folder
            </h2>

            {/* Folder Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a folder:
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const folder = folders.find(f => f.id === e.target.value);
                  setSelectedFolder(folder || null);
                }}
                value={selectedFolder?.id || ''}
              >
                <option value="">Select a folder...</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Documents List */}
            {selectedFolder && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 text-green-600" size={20} />
                  Documents in "{selectedFolder.name}"
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="ml-2 text-gray-600">Loading documents...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map(doc => (
                      <label
                        key={doc.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocuments.some(d => d.id === doc.id)}
                          onChange={() => handleDocumentToggle(doc)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">
                            Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                          </div>
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
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={20} />
                        Analyze {selectedDocuments.length} Document{selectedDocuments.length > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle Panel - Analysis Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="mr-2 text-green-600" size={24} />
              Analysis Results
            </h2>

            {analysisResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto mb-4" size={48} />
                <p>Select documents and click analyze to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {analysisResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {result.documentTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Language: <span className="font-medium">{result.language}</span>
                    </p>

                    {/* Spelling Errors */}
                    {result.spellingErrors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-700 mb-2">Spelling Errors</h4>
                        <ul className="space-y-1">
                          {result.spellingErrors.map((error, idx) => (
                            <li key={idx} className="text-sm">
                              <span className="text-red-600">{error.original}</span> → 
                              <span className="text-green-600 ml-1">{error.corrected}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Grammar Errors */}
                    {result.grammarErrors.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-orange-700 mb-2">Grammar Errors</h4>
                        <div className="space-y-3">
                          {result.grammarErrors.map((error, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-gray-700 mb-1">"{error.original}"</div>
                              <div className="text-orange-600 mb-1">✖ {error.explanation}</div>
                              <div className="text-green-600">✔ "{error.corrected}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style Suggestions */}
                    {result.styleSuggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Style Suggestions</h4>
                        <div className="space-y-3">
                          {result.styleSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="text-gray-700 mb-1">Original: "{suggestion.original}"</div>
                              <div className="text-blue-600">Suggestion: "{suggestion.suggestion}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.spellingErrors.length === 0 && 
                     result.grammarErrors.length === 0 && 
                     result.styleSuggestions.length === 0 && (
                      <div className="text-green-600 text-center py-4">
                        <CheckCircle className="mx-auto mb-2" size={24} />
                        <p>No issues found! Your document looks great.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Demo Analyzer */}
          <DemoAnalyzer />
        </div>
      </div>
    </div>
  );
}

export default App; 