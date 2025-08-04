import React, { useState } from 'react';
import { Sparkles, Zap, Globe, Edit3, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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

const DemoAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTexts = [
    "This is a sample text with some spelling erors and grammer mistakes.",
    "The document contains various issues that need to be addressed.",
    "Here's another example with different types of problems."
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
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
          { original: 'erors', corrected: 'errors' },
          { original: 'grammer', corrected: 'grammar' }
        ],
        grammarErrors: [
          {
            original: 'This is a sample text with some spelling erors and grammer mistakes.',
            explanation: 'Consider using more specific language',
            corrected: 'This sample text contains several spelling errors and grammar mistakes.'
          }
        ],
        styleSuggestions: [
          {
            original: 'This is a sample text',
            suggestion: 'Consider starting with a more engaging opening'
          }
        ]
      });
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleText = (sample: string) => {
    setText(sample);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Edit3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Text Analysis</h2>
        </div>

        {/* Sample Texts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Try sample text:
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleText(sample)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Sample {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your text:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here for analysis..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            rows={6}
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
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
              <span>Analyze Text</span>
            </div>
          )}
        </button>
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

export default DemoAnalyzer; 