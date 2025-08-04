import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
        <FileText className="mr-2 text-purple-600" size={24} />
        Demo Text Analyzer
      </h2>

      <p className="text-gray-600 mb-6">
        Test the analysis functionality with sample text or your own content.
      </p>

      {/* Sample Text Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Load Sample Text:
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => loadSampleText('turkish')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Turkish Sample
          </button>
          <button
            onClick={() => loadSampleText('english')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            English Sample
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter document title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter or paste your document content here..."
          />
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeText}
        disabled={loading || !content.trim() || !title.trim()}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="mr-2" size={20} />
            Analyze Text
          </>
        )}
      </button>

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

export default DemoAnalyzer; 