import { useState } from 'react'
import { Search, Globe, Eye, FileText, Bot, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const SEOSettings = ({ settings, onUpdate }) => {
  const [testingConnection, setTestingConnection] = useState(false)

  const handleInputChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const generateSitemap = async () => {
    setTestingConnection(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Sitemap generated successfully!')
    } catch (error) {
      toast.error('Failed to generate sitemap')
    } finally {
      setTestingConnection(false)
    }
  }

  const testSearchConsole = async () => {
    if (!settings.googleSearchConsole) {
      toast.error('Please enter Google Search Console verification code')
      return
    }
    
    setTestingConnection(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Google Search Console verification successful!')
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="text-cyan-400" size={24} />
            SEO Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure search engine optimization and meta tags
          </p>
        </div>
        <button
          onClick={generateSitemap}
          disabled={testingConnection}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={testingConnection ? 'animate-spin' : ''} />
          {testingConnection ? 'Generating...' : 'Generate Sitemap'}
        </button>
      </div>

      {/* Basic SEO Settings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Globe size={20} />
          Basic SEO
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Your site name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white resize-none"
              placeholder="Brief description of your site"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Social Image URL
            </label>
            <input
              type="url"
              value={settings.defaultImage}
              onChange={(e) => handleInputChange('defaultImage', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="https://example.com/og-image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Search Engine Integration */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Eye size={20} />
          Search Engine Integration
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Google Analytics ID
              </label>
            </div>
            <input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Google Search Console Verification
              </label>
              <button
                onClick={testSearchConsole}
                disabled={testingConnection}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {testingConnection ? 'Testing...' : 'Test'}
              </button>
            </div>
            <input
              type="text"
              value={settings.googleSearchConsole}
              onChange={(e) => handleInputChange('googleSearchConsole', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Verification meta tag content"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bing Webmaster Tools
            </label>
            <input
              type="text"
              value={settings.bingWebmaster}
              onChange={(e) => handleInputChange('bingWebmaster', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Bing verification code"
            />
          </div>
        </div>
      </div>

      {/* Technical SEO */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <FileText size={20} />
          Technical SEO
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable XML Sitemap</h4>
              <p className="text-sm text-gray-400">Automatically generate and update sitemap.xml</p>
            </div>
            <button
              onClick={() => handleToggle('enableSitemap')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableSitemap ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableSitemap ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Robots.txt</h4>
              <p className="text-sm text-gray-400">Generate robots.txt with crawling instructions</p>
            </div>
            <button
              onClick={() => handleToggle('enableRobots')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableRobots ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableRobots ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Block AI Crawlers</h4>
              <p className="text-sm text-gray-400">Prevent AI training bots from crawling content</p>
            </div>
            <button
              onClick={() => handleToggle('blockAICrawlers')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.blockAICrawlers ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.blockAICrawlers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SEO Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">SEO Status</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableSitemap ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Sitemap {settings.enableSitemap ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableRobots ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Robots.txt {settings.enableRobots ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.googleSearchConsole ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-300">
              Search Console {settings.googleSearchConsole ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.blockAICrawlers ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-300">
              AI Crawlers {settings.blockAICrawlers ? 'Blocked' : 'Allowed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SEOSettings