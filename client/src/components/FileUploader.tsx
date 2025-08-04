import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
        <Upload className="mr-2 text-orange-600" size={24} />
        File Upload
      </h2>

      <p className="text-gray-600 mb-6">
        Upload PDF, DOCX, DOC, or TXT files for analysis. Maximum file size: 10MB.
      </p>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-orange-400 bg-orange-50' 
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
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, DOCX, DOC, and TXT files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="text-4xl mr-4">
              {getFileIcon(uploadedFile.type)}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {getFileTypeName(uploadedFile.type)} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {uploadedFile && (
        <button
          onClick={uploadFile}
          disabled={loading}
          className="mt-6 w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="mr-2" size={20} />
              Analyze File
            </>
          )}
        </button>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-600" size={20} />
            Analysis Results
          </h3>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {analysisResult.documentTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Language: <span className="font-medium">{analysisResult.language}</span>
            </p>

            {/* Spelling Errors */}
            {analysisResult.spellingErrors.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-red-700 mb-2">Spelling Errors</h5>
                <ul className="space-y-1">
                  {analysisResult.spellingErrors.map((error, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="text-red-600">{error.original}</span> → 
                      <span className="text-green-600 ml-1">{error.corrected}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grammar Errors */}
            {analysisResult.grammarErrors.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-orange-700 mb-2">Grammar Errors</h5>
                <div className="space-y-3">
                  {analysisResult.grammarErrors.map((error, idx) => (
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
            {analysisResult.styleSuggestions.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Style Suggestions</h5>
                <div className="space-y-3">
                  {analysisResult.styleSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="text-gray-700 mb-1">Original: "{suggestion.original}"</div>
                      <div className="text-blue-600">Suggestion: "{suggestion.suggestion}"</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.spellingErrors.length === 0 && 
             analysisResult.grammarErrors.length === 0 && 
             analysisResult.styleSuggestions.length === 0 && (
              <div className="text-green-600 text-center py-4">
                <CheckCircle className="mx-auto mb-2" size={24} />
                <p>No issues found! Your document looks great.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 