import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Shield, Sparkles } from 'lucide-react';

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

const FileUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    setAnalysisResult(null);
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files only.');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setUploadedFile(file);
  };

  const uploadFile = async () => {
    if (!uploadedFile) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post(`${API_BASE_URL}/api/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(response.data.results[0]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload and analyze file');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return '📄';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝';
      case 'application/msword':
        return '📄';
      case 'text/plain':
        return '📄';
      default:
        return '📄';
    }
  };

  const getFileTypeName = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return 'PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      case 'application/msword':
        return 'DOC';
      case 'text/plain':
        return 'TXT';
      default:
        return 'File';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Upload className="mr-3 text-orange-600" size={28} />
          File Upload
        </h2>
        <div className="flex items-center space-x-2">
          <Shield className="text-green-500" size={20} />
          <span className="text-sm text-gray-600">Secure</span>
        </div>
      </div>

      <p className="text-gray-600 mb-8 leading-relaxed">
        Upload PDF, DOCX, DOC, or TXT files for analysis. Maximum file size: 10MB. Your files are processed securely and privately.
      </p>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium mb-2">Upload Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-orange-400 bg-orange-50 scale-105' 
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {!uploadedFile ? (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="text-orange-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Drop your file here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Supports PDF, DOCX, DOC, and TXT files up to 10MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold transform hover:scale-105 shadow-lg"
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="text-5xl mr-6">
              {getFileIcon(uploadedFile.type)}
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{uploadedFile.name}</h3>
              <p className="text-gray-600">
                {getFileTypeName(uploadedFile.type)} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <X size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {uploadedFile && (
        <button
          onClick={uploadFile}
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-3" size={24} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-3" size={24} />
              Analyze File
            </>
          )}
        </button>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="mr-3 text-green-600" size={24} />
            Analysis Results
          </h3>

          <div className="border border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {analysisResult.documentTitle}
              </h4>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {analysisResult.language}
              </span>
            </div>

            {/* Spelling Errors */}
            {analysisResult.spellingErrors.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center">
                  <AlertCircle className="mr-2" size={18} />
                  Spelling Errors ({analysisResult.spellingErrors.length})
                </h5>
                <div className="space-y-2">
                  {analysisResult.spellingErrors.map((error, idx) => (
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
            {analysisResult.grammarErrors.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold text-orange-700 mb-3 flex items-center">
                  <AlertCircle className="mr-2" size={18} />
                  Grammar Errors ({analysisResult.grammarErrors.length})
                </h5>
                <div className="space-y-4">
                  {analysisResult.grammarErrors.map((error, idx) => (
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
            {analysisResult.styleSuggestions.length > 0 && (
              <div className="mb-6">
                <h5 className="font-semibold text-blue-700 mb-3 flex items-center">
                  <Sparkles className="mr-2" size={18} />
                  Style Suggestions ({analysisResult.styleSuggestions.length})
                </h5>
                <div className="space-y-4">
                  {analysisResult.styleSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-gray-700 mb-2 font-medium">Original: "{suggestion.original}"</div>
                      <div className="text-blue-600 font-medium">Suggestion: "{suggestion.suggestion}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.spellingErrors.length === 0 && 
             analysisResult.grammarErrors.length === 0 && 
             analysisResult.styleSuggestions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-green-700 mb-2">Perfect Document!</h4>
                <p className="text-green-600">No issues found. Your document looks great!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 