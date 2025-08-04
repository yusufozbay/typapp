import React, { useState } from 'react';
import { Upload, FileText, Shield, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisResult {
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
  const [files, setFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setAnalysisResult(null);
    setError(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
    setAnalysisResult(null);
    setError(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setAnalysisResult(null);
    setError(null);
  };

  const analyzeFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      setAnalysisResult({
        language: 'English',
        spellingErrors: [
          { original: 'documant', corrected: 'document' },
          { original: 'analisis', corrected: 'analysis' }
        ],
        grammarErrors: [
          {
            original: 'This documant needs analisis.',
            explanation: 'Consider using more formal language',
            corrected: 'This document requires analysis.'
          }
        ],
        styleSuggestions: [
          {
            original: 'This is a file',
            suggestion: 'Consider adding more descriptive content'
          }
        ]
      });
    } catch (err) {
      setError('Failed to analyze files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">File Upload</h2>
          <Shield className="w-5 h-5 text-green-600" />
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload files for analysis:
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports .txt, .doc, .docx, .pdf files
            </p>
            <input
              type="file"
              multiple
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Choose Files
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Files</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {files.length > 0 && (
          <button
            onClick={analyzeFiles}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Analyze Files</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
          </div>

          {/* Language */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Language: </span>
            <span className="text-sm text-gray-600">{analysisResult.language}</span>
          </div>

          {/* Spelling Errors */}
          {analysisResult.spellingErrors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Spelling Errors</h4>
              <div className="space-y-2">
                {analysisResult.spellingErrors.map((error, idx) => (
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
          {analysisResult.grammarErrors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Grammar Suggestions</h4>
              <div className="space-y-3">
                {analysisResult.grammarErrors.map((error, idx) => (
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
          {analysisResult.styleSuggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Style Suggestions</h4>
              <div className="space-y-2">
                {analysisResult.styleSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="text-gray-600 mb-1">{suggestion.original}</div>
                    <div className="text-blue-600 font-medium">{suggestion.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 