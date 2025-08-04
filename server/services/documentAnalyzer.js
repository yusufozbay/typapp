const { LanguageDetector } = require('languagedetector');
const natural = require('natural');

class DocumentAnalyzer {
  constructor() {
    this.languageDetector = new LanguageDetector();
    this.tokenizer = new natural.WordTokenizer();
    
    // Language-specific dictionaries and patterns
    this.languagePatterns = {
      turkish: {
        spellingPatterns: {
          'yapıcaz': 'yapacağız',
          'gercekleşicek': 'gerçekleşecek',
          'katılcakmısın': 'katılacak mısın',
          'gelicek': 'gelecek',
          'gidecek': 'gidecek',
          'olacak': 'olacak'
        },
        grammarPatterns: [
          {
            pattern: /(\w+)(mı|mi|mu|mü)(\s|$)/gi,
            explanation: 'Soru eki ayrı yazılmalı',
            replacement: '$1 $2$3'
          },
          {
            pattern: /(\w+)(da|de|ta|te)(\s|$)/gi,
            explanation: 'Ek ayrı yazılmalı',
            replacement: '$1 $2$3'
          }
        ]
      },
      english: {
        spellingPatterns: {
          'recieve': 'receive',
          'seperate': 'separate',
          'occured': 'occurred',
          'begining': 'beginning',
          'definately': 'definitely'
        },
        grammarPatterns: [
          {
            pattern: /\b(its|it's)\b/gi,
            explanation: 'Check if possessive or contraction is intended',
            replacement: (match) => match.toLowerCase() === 'its' ? "it's" : 'its'
          }
        ]
      },
      german: {
        spellingPatterns: {
          'dass': 'dass',
          'daß': 'dass',
          'muß': 'muss',
          'daß': 'dass'
        },
        grammarPatterns: [
          {
            pattern: /(\w+)(nicht|kein|keine|keinen)(\s|$)/gi,
            explanation: 'Negation word order check',
            replacement: '$1 $2$3'
          }
        ]
      },
      french: {
        spellingPatterns: {
          'acceuillir': 'accueillir',
          'appartement': 'appartement',
          'bienvenu': 'bienvenue'
        },
        grammarPatterns: [
          {
            pattern: /(\w+)(pas|plus|jamais)(\s|$)/gi,
            explanation: 'Negation word order check',
            replacement: '$1 $2$3'
          }
        ]
      }
    };
  }

  async analyzeDocument(document) {
    const { title, content } = document;
    
    // Detect language
    const language = this.detectLanguage(content);
    
    // Initialize analysis result
    const analysis = {
      documentTitle: title,
      language: language,
      spellingErrors: [],
      grammarErrors: [],
      styleSuggestions: []
    };

    // Perform language-specific analysis
    if (this.languagePatterns[language]) {
      await this.analyzeSpelling(content, language, analysis);
      await this.analyzeGrammar(content, language, analysis);
      await this.analyzeStyle(content, language, analysis);
    }

    return analysis;
  }

  detectLanguage(text) {
    // Enhanced language detection with character patterns
    const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
    const germanChars = /[äöüßÄÖÜ]/;
    const frenchChars = /[àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/;
    
    // Count language-specific characters
    const turkishCount = (text.match(turkishChars) || []).length;
    const germanCount = (text.match(germanChars) || []).length;
    const frenchCount = (text.match(frenchChars) || []).length;
    
    // Common words for each language
    const turkishWords = ['ve', 'bir', 'bu', 'da', 'de', 'ile', 'için', 'olan', 'olarak'];
    const germanWords = ['und', 'der', 'die', 'das', 'in', 'den', 'von', 'mit', 'zu', 'auf'];
    const frenchWords = ['et', 'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'pour'];
    
    const words = text.toLowerCase().split(/\s+/);
    const turkishWordCount = words.filter(word => turkishWords.includes(word)).length;
    const germanWordCount = words.filter(word => germanWords.includes(word)).length;
    const frenchWordCount = words.filter(word => frenchWords.includes(word)).length;
    
    // Calculate language score
    const scores = {
      turkish: turkishCount * 2 + turkishWordCount,
      german: germanCount * 2 + germanWordCount,
      french: frenchCount * 2 + frenchWordCount,
      english: 0
    };
    
    // If no specific language indicators, default to English
    if (Object.values(scores).every(score => score === 0)) {
      return 'english';
    }
    
    // Return language with highest score
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  }

  async analyzeSpelling(content, language, analysis) {
    const patterns = this.languagePatterns[language]?.spellingPatterns || {};
    const words = content.toLowerCase().split(/\s+/);
    
    for (const [incorrect, correct] of Object.entries(patterns)) {
      if (words.includes(incorrect.toLowerCase())) {
        analysis.spellingErrors.push({
          original: incorrect,
          corrected: correct
        });
      }
    }
  }

  async analyzeGrammar(content, language, analysis) {
    const patterns = this.languagePatterns[language]?.grammarPatterns || [];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          const corrected = content.replace(pattern.pattern, pattern.replacement);
          analysis.grammarErrors.push({
            original: match,
            explanation: pattern.explanation,
            corrected: corrected
          });
        });
      }
    }
  }

  async analyzeStyle(content, language, analysis) {
    // Language-specific style suggestions
    const stylePatterns = {
      turkish: [
        {
          pattern: /genel olarak fena sayılmaz/gi,
          suggestion: 'genel olarak tatmin edici bir sonuç sunuyor'
        },
        {
          pattern: /çok iyi çünkü hızlı çalışıyor/gi,
          suggestion: 'çok iyi çünkü kullanıcı sorunlarını hızlıca çözüyor'
        }
      ],
      english: [
        {
          pattern: /very good because it works fast/gi,
          suggestion: 'very good because it efficiently solves user problems'
        },
        {
          pattern: /not bad overall/gi,
          suggestion: 'satisfactory overall'
        }
      ],
      german: [
        {
          pattern: /sehr gut weil es schnell funktioniert/gi,
          suggestion: 'sehr gut weil es Benutzerprobleme effizient löst'
        }
      ],
      french: [
        {
          pattern: /très bien parce que ça marche vite/gi,
          suggestion: 'très bien parce que ça résout efficacement les problèmes des utilisateurs'
        }
      ]
    };

    const patterns = stylePatterns[language] || [];
    
    for (const pattern of patterns) {
      if (content.match(pattern.pattern)) {
        analysis.styleSuggestions.push({
          original: content.match(pattern.pattern)[0],
          suggestion: pattern.suggestion
        });
      }
    }
  }

  formatAnalysisResult(analysis) {
    let result = `---\n`;
    result += `Document Title: ${analysis.documentTitle}\n\n`;
    result += `Language: ${analysis.language}\n\n`;

    if (analysis.spellingErrors.length > 0) {
      result += `### Spelling Errors\n`;
      analysis.spellingErrors.forEach(error => {
        result += `- ${error.original} → ${error.corrected}\n`;
      });
      result += `\n`;
    }

    if (analysis.grammarErrors.length > 0) {
      result += `### Grammar Errors\n`;
      analysis.grammarErrors.forEach((error, index) => {
        result += `${index + 1}. "${error.original}"\n`;
        result += `   ✖ ${error.explanation}\n`;
        result += `   ✔ "${error.corrected}"\n\n`;
      });
    }

    if (analysis.styleSuggestions.length > 0) {
      result += `### Style Suggestions (Optional)\n`;
      analysis.styleSuggestions.forEach(suggestion => {
        result += `- Original: "${suggestion.original}"\n`;
        result += `  Suggestion: "${suggestion.suggestion}"\n\n`;
      });
    }

    if (analysis.spellingErrors.length === 0 && 
        analysis.grammarErrors.length === 0 && 
        analysis.styleSuggestions.length === 0) {
      result += `No issues found! Your document looks great.\n`;
    }

    result += `---\n`;
    return result;
  }
}

module.exports = DocumentAnalyzer; 