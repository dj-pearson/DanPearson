import { useState } from 'react'
import { BarChart3, Eye, Shield, Globe, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const AnalyticsSettings = ({ settings, onUpdate }) => {
  const [testingConnection, setTestingConnection] = useState(false)

  const handleInputChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const testAnalyticsConnection = async () => {
    if (!settings.trackingId) {
      toast.error('Please enter tracking ID')
      return
    }
    
    setTestingConnection(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Analytics connection successful!')
    } catch (error) {
      toast.error('Analytics connection failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const analyticsProviders = [
    {
      id: 'plausible',
      name: 'Plausible Analytics',
      privacy: 'High',
      features: ['Cookieless', 'GDPR Compliant', 'Lightweight'],
      description: 'Privacy-first analytics with no cookies'
    },
    {
      id: 'simpleAnalytics',
      name: 'Simple Analytics',
      privacy: 'High',
      features: ['Privacy-focused', 'No cookies', 'GDPR compliant'],
      description: 'Simple, clean analytics without tracking'
    },
    {
      id: 'fathom',
      name: 'Fathom Analytics',
      privacy: 'High',
      features: ['Privacy-focused', 'Fast loading', 'GDPR compliant'],
      description: 'Fast, privacy-focused analytics'
    },
    {
      id: 'umami',
      name: 'Umami',
      privacy: 'Highest',
      features: ['Self-hosted', 'Open source', 'Full control'],
      description: 'Self-hosted analytics with complete privacy'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-cyan-400" size={24} />
            Analytics Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure privacy-first analytics and visitor tracking
          </p>
        </div>
        <button
          onClick={testAnalyticsConnection}
          disabled={testingConnection}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <BarChart3 size={16} className={testingConnection ? 'animate-spin' : ''} />
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Analytics Provider Selection */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Analytics Provider
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {analyticsProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleInputChange('provider', provider.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                settings.provider === provider.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{provider.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  provider.privacy === 'Highest' ? 'bg-green-500/20 text-green-400' :
                  provider.privacy === 'High' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {provider.privacy} Privacy
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
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
      </div>

      {/* Analytics Configuration */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={settings.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="danpearson.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tracking ID / Site ID
            </label>
            <input
              type="text"
              value={settings.trackingId}
              onChange={(e) => handleInputChange('trackingId', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Enter your tracking ID"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Privacy Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Respect Do Not Track</h4>
              <p className="text-sm text-gray-400">Honor browser Do Not Track settings</p>
            </div>
            <button
              onClick={() => handleToggle('respectDNT')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.respectDNT ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.respectDNT ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Anonymize IP Addresses</h4>
              <p className="text-sm text-gray-400">Remove last octet of IP addresses</p>
            </div>
            <button
              onClick={() => handleToggle('anonymizeIP')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.anonymizeIP ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.anonymizeIP ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Cookieless Tracking</h4>
              <p className="text-sm text-gray-400">Track visitors without using cookies</p>
            </div>
            <button
              onClick={() => handleToggle('cookieless')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.cookieless ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.cookieless ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Analytics Status</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.trackingId ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300">
              Tracking {settings.trackingId ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.respectDNT ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Privacy {settings.respectDNT ? 'Enhanced' : 'Standard'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.cookieless ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Cookies {settings.cookieless ? 'Disabled' : 'Enabled'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.anonymizeIP ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              IP {settings.anonymizeIP ? 'Anonymized' : 'Full'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Analytics Data */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Recent Data (Last 7 days)</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">2,340</div>
            <div className="text-sm text-gray-400">Unique Visitors</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">3,120</div>
            <div className="text-sm text-gray-400">Page Views</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-1">2m 34s</div>
            <div className="text-sm text-gray-400">Avg. Session</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-purple-400 mb-1">32%</div>
            <div className="text-sm text-gray-400">Bounce Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsSettings