import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Bot, 
  Settings, 
  Key, 
  Zap, 
  Brain, 
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

const AITools = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    claude: '',
    gemini: ''
  })
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
    gemini: false
  })
  const [defaultModel, setDefaultModel] = useState('gpt-4')
  const [isTestingConnection, setIsTestingConnection] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState({
    openai: 'disconnected',
    claude: 'disconnected',
    gemini: 'disconnected'
  })
  const [aiSettings, setAISettings] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    autoSEO: true,
    contentOptimization: true,
    multiLanguage: false
  })
  
  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-3.5-turbo'],
      description: 'GPT-4 and GPT-3.5 models for content generation',
      color: 'from-green-500 to-emerald-600',
      setupUrl: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      models: ['claude-3', 'claude-2'],
      description: 'Claude models for thoughtful content creation',
      color: 'from-orange-500 to-red-600',
      setupUrl: 'https://console.anthropic.com/'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      models: ['gemini-pro', 'gemini-pro-vision'],
      description: 'Google\'s advanced AI for creative tasks',
      color: 'from-blue-500 to-indigo-600',
      setupUrl: 'https://makersuite.google.com/app/apikey'
    }
  ]
  
  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }
  
  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }
  
  const testConnection = async (provider) => {
    if (!apiKeys[provider]) {
      toast.error('Please enter an API key first')
      return
    }
    
    setIsTestingConnection(provider)
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success/failure
      const isValid = apiKeys[provider].length > 10 // Simple validation
      
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: isValid ? 'connected' : 'error'
      }))
      
      if (isValid) {
        toast.success(`${aiProviders.find(p => p.id === provider)?.name} connected successfully!`)
      } else {
        toast.error('Invalid API key or connection failed')
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: 'error'
      }))
      toast.error('Connection test failed')
    } finally {
      setIsTestingConnection(null)
    }
  }
  
  const saveSettings = () => {
    // Save to localStorage for demo
    localStorage.setItem('aiSettings', JSON.stringify({
      apiKeys,
      defaultModel,
      aiSettings
    }))
    toast.success('AI settings saved successfully!')
  }
  
  const handleSettingChange = (setting, value) => {
    setAISettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bot className="text-cyan-400" size={32} />
          AI Integration Settings
        </h1>
        <button
          onClick={saveSettings}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
        >
          Save Settings
        </button>
      </div>
      
      {/* API Configuration */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Key size={20} />
              API Configuration
            </h2>
            
            <div className="space-y-6">
              {aiProviders.map((provider) => (
                <div key={provider.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connectionStatus[provider.id] === 'connected' ? 'bg-green-500' :
                        connectionStatus[provider.id] === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <h3 className="font-medium text-white">{provider.name}</h3>
                    </div>
                    <a
                      href={provider.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Get API Key
                    </a>
                  </div>
                  
                  <p className="text-sm text-gray-400">{provider.description}</p>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        value={apiKeys[provider.id]}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        placeholder={`Enter ${provider.name} API key...`}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(provider.id)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showKeys[provider.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <button
                      onClick={() => testConnection(provider.id)}
                      disabled={isTestingConnection === provider.id || !apiKeys[provider.id]}
                      className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isTestingConnection === provider.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model) => (
                      <span
                        key={model}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* AI Settings */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Settings size={20} />
              Generation Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default AI Model
                </label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                >
                  <option value="gpt-4">GPT-4 (OpenAI)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
                  <option value="claude-3">Claude 3 (Anthropic)</option>
                  <option value="gemini-pro">Gemini Pro (Google)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temperature: {aiSettings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={aiSettings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Auto SEO Generation</h4>
                    <p className="text-sm text-gray-400">Automatically generate SEO titles and descriptions</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoSEO', !aiSettings.autoSEO)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiSettings.autoSEO ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        aiSettings.autoSEO ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Content Optimization</h4>
                    <p className="text-sm text-gray-400">Optimize content for readability and engagement</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('contentOptimization', !aiSettings.contentOptimization)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiSettings.contentOptimization ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        aiSettings.contentOptimization ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Multi-language Support</h4>
                    <p className="text-sm text-gray-400">Enable content generation in multiple languages</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('multiLanguage', !aiSettings.multiLanguage)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      aiSettings.multiLanguage ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        aiSettings.multiLanguage ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Usage Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Brain size={20} />
              Usage Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Articles Generated</span>
                <span className="font-semibold text-white">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Tokens Used This Month</span>
                <span className="font-semibold text-white">45,230</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">SEO Optimizations</span>
                <span className="font-semibold text-white">18</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Most Used Model</span>
                <span className="font-semibold text-white">GPT-4</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
          <Sparkles size={20} />
          AI Integration Status
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {aiProviders.map((provider) => (
            <div key={provider.id} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{provider.name}</h3>
                {connectionStatus[provider.id] === 'connected' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : connectionStatus[provider.id] === 'error' ? (
                  <AlertTriangle size={20} className="text-red-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
                )}
              </div>
              <p className="text-sm text-gray-400">
                {connectionStatus[provider.id] === 'connected' ? 'Connected and ready' :
                 connectionStatus[provider.id] === 'error' ? 'Connection failed' :
                 'Not configured'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AITools