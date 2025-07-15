import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Zap, 
  Search, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  X,
  RefreshCw,
  Eye,
  BarChart3,
  Globe
} from 'lucide-react'

const SEOOptimizer = ({ currentData, onOptimize, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [seoScore, setSeoScore] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [optimizedData, setOptimizedData] = useState({
    title: currentData.title || '',
    excerpt: currentData.excerpt || '',
    seoTitle: currentData.seoTitle || '',
    seoDescription: currentData.seoDescription || '',
    tags: currentData.tags || [],
    readTime: currentData.readTime || '5 min read'
  })
  const [keywordSuggestions, setKeywordSuggestions] = useState([])
  const [competitorAnalysis, setCompetitorAnalysis] = useState([])
  
  useEffect(() => {
    performSEOAnalysis()
  }, [currentData])
  
  const performSEOAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate SEO analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const issues = []
      const suggestions = []
      let score = 100
      
      // Title Analysis
      if (!currentData.title) {
        issues.push({ type: 'error', field: 'title', message: 'Title is missing' })
        score -= 20
      } else if (currentData.title.length < 30) {
        issues.push({ type: 'warning', field: 'title', message: 'Title is too short (recommended: 30-60 characters)' })
        score -= 10
      } else if (currentData.title.length > 60) {
        issues.push({ type: 'warning', field: 'title', message: 'Title is too long (recommended: 30-60 characters)' })
        score -= 5
      }
      
      // SEO Title Analysis
      if (!currentData.seoTitle) {
        suggestions.push({ type: 'suggestion', field: 'seoTitle', message: 'Add an SEO-optimized title' })
        score -= 15
      }
      
      // Meta Description Analysis
      if (!currentData.seoDescription) {
        issues.push({ type: 'error', field: 'seoDescription', message: 'Meta description is missing' })
        score -= 15
      } else if (currentData.seoDescription.length < 120) {
        issues.push({ type: 'warning', field: 'seoDescription', message: 'Meta description is too short (recommended: 120-160 characters)' })
        score -= 10
      }
      
      // Content Analysis
      if (!currentData.content || currentData.content.length < 300) {
        issues.push({ type: 'warning', field: 'content', message: 'Content is too short for good SEO (recommended: 300+ words)' })
        score -= 15
      }
      
      // Tags Analysis
      if (!currentData.tags || currentData.tags.length === 0) {
        suggestions.push({ type: 'suggestion', field: 'tags', message: 'Add relevant tags to improve discoverability' })
        score -= 10
      }
      
      // Image Analysis
      if (!currentData.image) {
        suggestions.push({ type: 'suggestion', field: 'image', message: 'Add a featured image to improve engagement' })
        score -= 5
      }
      
      setSeoScore(Math.max(0, score))
      setAnalysis({ issues, suggestions })
      
      // Generate keyword suggestions
      const keywords = generateKeywordSuggestions(currentData.title, currentData.category)
      setKeywordSuggestions(keywords)
      
      // Generate competitor analysis
      const competitors = generateCompetitorAnalysis(currentData.category)
      setCompetitorAnalysis(competitors)
      
    } catch (error) {
      toast.error('Failed to analyze SEO')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const generateKeywordSuggestions = (title, category) => {
    const baseKeywords = {
      'AI & Technology': ['artificial intelligence', 'machine learning', 'AI tools', 'automation', 'technology trends'],
      'NFT & Blockchain': ['NFT', 'blockchain', 'cryptocurrency', 'digital assets', 'web3'],
      'Sales & Leadership': ['sales strategy', 'leadership', 'business growth', 'team management', 'sales tips'],
      'Development': ['web development', 'programming', 'coding', 'software development', 'tech stack'],
      'Business Strategy': ['business strategy', 'entrepreneurship', 'startup', 'business growth', 'innovation']
    }
    
    const categoryKeywords = baseKeywords[category] || ['business', 'technology', 'innovation']
    
    return categoryKeywords.map((keyword, index) => ({
      keyword,
      volume: Math.floor(Math.random() * 10000) + 1000,
      difficulty: Math.floor(Math.random() * 100) + 1,
      relevance: Math.floor(Math.random() * 40) + 60
    }))
  }
  
  const generateCompetitorAnalysis = (category) => {
    return [
      {
        title: 'The Future of AI in Business Operations',
        url: 'competitor1.com',
        seoScore: 85,
        keywords: ['AI business', 'automation', 'efficiency'],
        backlinks: 45
      },
      {
        title: 'Complete Guide to NFT Development',
        url: 'competitor2.com',
        seoScore: 78,
        keywords: ['NFT development', 'blockchain', 'digital art'],
        backlinks: 32
      },
      {
        title: 'Sales Leadership Best Practices 2024',
        url: 'competitor3.com',
        seoScore: 82,
        keywords: ['sales leadership', 'team management', 'growth'],
        backlinks: 28
      }
    ]
  }
  
  const optimizeField = (field) => {
    const optimizations = {
      seoTitle: currentData.title ? 
        `${currentData.title} | Expert Guide 2024` : 
        'Expert Guide 2024',
      seoDescription: currentData.excerpt ? 
        `${currentData.excerpt.substring(0, 140)}... Learn more from industry experts.` :
        'Discover expert insights and practical strategies. Learn from industry professionals with proven results.',
      tags: [...(currentData.tags || []), ...keywordSuggestions.slice(0, 3).map(k => k.keyword)]
    }
    
    if (optimizations[field]) {
      setOptimizedData(prev => ({
        ...prev,
        [field]: optimizations[field]
      }))
      toast.success(`${field} optimized!`)
    }
  }
  
  const applyAllOptimizations = () => {
    const fullyOptimized = {
      ...optimizedData,
      seoTitle: optimizedData.seoTitle || `${currentData.title} | Expert Guide 2024`,
      seoDescription: optimizedData.seoDescription || 
        `${currentData.excerpt?.substring(0, 140) || 'Discover expert insights and practical strategies'}... Learn more from industry experts.`,
      tags: [...new Set([...(currentData.tags || []), ...keywordSuggestions.slice(0, 5).map(k => k.keyword)])]
    }
    
    onOptimize(fullyOptimized)
  }
  
  const getSEOScoreColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  const getSEOScoreBg = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gray-800 rounded-xl p-6 border border-green-500/20 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
          <Zap size={24} />
          SEO Optimizer
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* SEO Score */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white">SEO Score</h4>
            <button
              onClick={performSEOAnalysis}
              disabled={isAnalyzing}
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold ${getSEOScoreColor(seoScore)}`}>
              {isAnalyzing ? '...' : seoScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getSEOScoreBg(seoScore)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {seoScore >= 80 ? 'Excellent' : seoScore >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Target size={16} />
            Readability
          </h4>
          <div className="text-2xl font-bold text-blue-400 mb-1">Good</div>
          <p className="text-xs text-gray-400">Easy to read and understand</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <TrendingUp size={16} />
            Performance
          </h4>
          <div className="text-2xl font-bold text-green-400 mb-1">Fast</div>
          <p className="text-xs text-gray-400">Optimized for speed</p>
        </div>
      </div>
      
      {/* Issues and Suggestions */}
      {analysis && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              Issues ({analysis.issues.length})
            </h4>
            <div className="space-y-2">
              {analysis.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300">{issue.message}</p>
                    <button
                      onClick={() => optimizeField(issue.field)}
                      className="text-xs text-red-400 hover:text-red-300 mt-1"
                    >
                      Fix this →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
              <Search size={16} />
              Suggestions ({analysis.suggestions.length})
            </h4>
            <div className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <CheckCircle size={16} className="text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-300">{suggestion.message}</p>
                    <button
                      onClick={() => optimizeField(suggestion.field)}
                      className="text-xs text-yellow-400 hover:text-yellow-300 mt-1"
                    >
                      Apply →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Keyword Suggestions */}
      <div>
        <h4 className="font-medium text-cyan-400 mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Keyword Opportunities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {keywordSuggestions.slice(0, 6).map((keyword, index) => (
            <div key={index} className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{keyword.keyword}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  keyword.difficulty < 30 ? 'bg-green-500/20 text-green-400' :
                  keyword.difficulty < 70 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {keyword.difficulty < 30 ? 'Easy' : keyword.difficulty < 70 ? 'Medium' : 'Hard'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Volume: {keyword.volume.toLocaleString()}</span>
                <span>Match: {keyword.relevance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Competitor Analysis */}
      <div>
        <h4 className="font-medium text-purple-400 mb-3 flex items-center gap-2">
          <Globe size={16} />
          Competitor Analysis
        </h4>
        <div className="space-y-3">
          {competitorAnalysis.map((competitor, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-white">{competitor.title}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{competitor.url}</span>
                  <span className={`text-sm font-medium ${
                    competitor.seoScore >= 80 ? 'text-green-400' :
                    competitor.seoScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {competitor.seoScore}/100
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex flex-wrap gap-1">
                  {competitor.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-600 rounded text-xs">{kw}</span>
                  ))}
                </div>
                <span>{competitor.backlinks} backlinks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={applyAllOptimizations}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Zap size={18} />
          Apply All Optimizations
        </button>
        <button
          onClick={performSEOAnalysis}
          disabled={isAnalyzing}
          className="px-6 py-3 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw size={18} className={isAnalyzing ? 'animate-spin' : ''} />
          Re-analyze
        </button>
      </div>
    </motion.div>
  )
}

export default SEOOptimizer