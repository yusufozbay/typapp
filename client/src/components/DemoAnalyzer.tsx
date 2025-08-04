import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Loader2, CheckCircle, AlertCircle, Sparkles, Zap, Globe } from 'lucide-react';

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

const DemoAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTexts = {
    turkish: {
      title: 'Yeni Proje Notları',
      content: `Bu projemiz çok önemli çünkü kullanıcılarımız için faydalı olacak. Yarınki toplantıya katılcakmısın? 

Genel olarak fena sayılmaz ama daha iyi olabilir. Bu çözümümüz çok iyi çünkü hızlı çalışıyor.

Yapıcaz ve gercekleşicek. Bu projede çalışırken dikkatli olmalısın.`
    },
    english: {
      title: 'Project Planning Notes',
      content: `This project is very important because it will be beneficial for our users. Will you attend tomorrow's meeting?

Overall it's not bad but it could be better. This solution of ours is very good because it works fast.

We will do it and it will occur. You should be careful while working on this project.`
    }
  };

  const loadSampleText = (language: 'turkish' | 'english') => {
    const sample = sampleTexts[language];
    setTitle(sample.title);
    setContent(sample.content);
    setError(null);
    setAnalysisResult(null);
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const analyzeText = async () => {
    if (!content.trim() || !title.trim()) {
      setError('Please enter both title and content');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/api/analyze-demo`, {
        title: title.trim(),
        content: content.trim()
      });

      setAnalysisResult(response.data.results[0]);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 text-purple-600" size={28} />
          Demo Text Analyzer
        </h2>
        <div className="flex items-center space-x-2">
          <Sparkles className="text-purple-500" size={20} />
          <span className="text-sm text-gray-600">AI Powered</span>
        </div>
      </div>

      <p className="text-gray-600 mb-8 leading-relaxed">
        Test the analysis functionality with sample text or your own content. Get instant feedback on spelling, grammar, and style.
      </p>

      {/* Sample Text Buttons */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Load Sample Text:
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => loadSampleText('turkish')}
            className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 font-medium flex items-center"
          >
            <Globe className="mr-2" size={16} />
            Turkish Sample
          </button>
          <button
            onClick={() => loadSampleText('english')}
            className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 font-medium flex items-center"
          >
            <Globe className="mr-2" size={16} />
            English Sample
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium mb-2">Analysis Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Document Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
            placeholder="Enter document title..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Document Content:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 resize-none"
            placeholder="Enter or paste your document content here..."
          />
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeText}
        disabled={loading || !content.trim() || !title.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-3" size={24} />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="mr-3" size={24} />
            Analyze Text
          </>
        )}
      </button>

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
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
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

export default DemoAnalyzer; 