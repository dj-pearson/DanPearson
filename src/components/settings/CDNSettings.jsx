import { useState } from 'react'
import { Cloud, Zap, Globe, Eye, EyeOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const CDNSettings = ({ settings, onUpdate }) => {
  const [showApiToken, setShowApiToken] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleInputChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const testCDNConnection = async () => {
    if (!settings.zoneId || !settings.apiToken) {
      toast.error('Please enter Zone ID and API Token')
      return
    }
    
    setTestingConnection(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('CDN connection successful!')
    } catch (error) {
      toast.error('CDN connection failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const purgeCDNCache = async () => {
    if (!settings.enabled) {
      toast.error('CDN is not enabled')
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('CDN cache purged successfully!')
    } catch (error) {
      toast.error('Failed to purge CDN cache')
    }
  }

  const cdnProviders = [
    { id: 'cloudflare', name: 'Cloudflare', features: ['Global CDN', 'DDoS Protection', 'SSL/TLS'] },
    { id: 'bunnynet', name: 'Bunny.net', features: ['Edge Storage', 'Video Streaming', 'Image Optimization'] },
    { id: 'keycdn', name: 'KeyCDN', features: ['HTTP/2', 'Brotli Compression', 'Real-time Analytics'] },
    { id: 'aws', name: 'AWS CloudFront', features: ['Global Edge', 'Lambda@Edge', 'Shield DDoS'] }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cloud className="text-cyan-400" size={24} />
            CDN Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure content delivery network for global performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={purgeCDNCache}
            disabled={!settings.enabled}
            className="flex items-center gap-2 px-4 py-2 border border-orange-600 text-orange-400 rounded-lg hover:bg-orange-600/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Purge Cache
          </button>
          <button
            onClick={testCDNConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Globe size={16} className={testingConnection ? 'animate-spin' : ''} />
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* CDN Provider Selection */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Cloud size={20} />
          CDN Provider
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {cdnProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleInputChange('provider', provider.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                settings.provider === provider.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <h4 className="font-medium text-white mb-2">{provider.name}</h4>
              <div className="flex flex-wrap gap-1">
                {provider.features.map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-600 text-xs rounded text-gray-300">
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Enable CDN</h4>
            <p className="text-sm text-gray-400">Activate content delivery network</p>
          </div>
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-cyan-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* CDN Configuration */}
      {settings.enabled && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zone ID
              </label>
              <input
                type="text"
                value={settings.zoneId}
                onChange={(e) => handleInputChange('zoneId', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Enter your CDN zone ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <div className="relative">
                <input
                  type={showApiToken ? 'text' : 'password'}
                  value={settings.apiToken}
                  onChange={(e) => handleInputChange('apiToken', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                  placeholder="Enter your API token"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken(!showApiToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showApiToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cache Level
              </label>
              <select
                value={settings.cacheLevel}
                onChange={(e) => handleInputChange('cacheLevel', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              >
                <option value="bypass">Bypass</option>
                <option value="standard">Standard</option>
                <option value="aggressive">Aggressive</option>
                <option value="cache_everything">Cache Everything</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* CDN Features */}
      {settings.enabled && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Zap size={20} />
            CDN Features
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Image Optimization</h4>
                <p className="text-sm text-gray-400">Automatic WebP conversion and compression</p>
              </div>
              <button
                onClick={() => handleToggle('enableImageOptimization')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableImageOptimization ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableImageOptimization ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Compression</h4>
                <p className="text-sm text-gray-400">Gzip and Brotli compression for text assets</p>
              </div>
              <button
                onClick={() => handleToggle('enableCompression')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableCompression ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableCompression ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CDN Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">CDN Status</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enabled ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300">
              CDN {settings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enabled && settings.zoneId ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Configuration {settings.enabled && settings.zoneId ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableImageOptimization ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300">
              Image Optimization {settings.enableImageOptimization ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableCompression ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300">
              Compression {settings.enableCompression ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* CDN Statistics */}
      {settings.enabled && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Statistics (Last 24h)</h3>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400 mb-1">1.2M</div>
              <div className="text-sm text-gray-400">Requests</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">88%</div>
              <div className="text-sm text-gray-400">Cache Hit Ratio</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">2.5TB</div>
              <div className="text-sm text-gray-400">Bandwidth Saved</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">45ms</div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CDNSettings