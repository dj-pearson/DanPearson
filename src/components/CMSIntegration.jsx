import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCMS } from '../hooks/useCMS'
import { Settings, Database, Zap, Eye, Upload, RefreshCw } from 'lucide-react'

const CMSIntegration = () => {
  const [selectedCMS, setSelectedCMS] = useState('sanity')
  const [cmsConfig, setCmsConfig] = useState({
    sanity: {
      projectId: '',
      dataset: 'production',
      token: '',
      apiVersion: '2023-05-03'
    },
    contentful: {
      spaceId: '',
      accessToken: '',
      previewToken: '',
      environment: 'master'
    },
    strapi: {
      apiUrl: '',
      apiToken: '',
      version: 'v4'
    }
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({})
  const { fetchContent, previewContent, buildTrigger } = useCMS()

  const cmsOptions = [
    {
      id: 'sanity',
      name: 'Sanity',
      description: 'Structured content platform with real-time collaboration',
      features: ['Real-time editing', 'Custom schemas', 'Image optimization', 'GROQ queries'],
      pros: ['Developer-friendly', 'Flexible content modeling', 'Real-time updates'],
      cons: ['Learning curve', 'Pricing for large teams']
    },
    {
      id: 'contentful',
      name: 'Contentful',
      description: 'API-first content management platform',
      features: ['Rich text editor', 'Media management', 'Localization', 'CDN delivery'],
      pros: ['User-friendly interface', 'Great documentation', 'Robust API'],
      cons: ['Limited customization', 'Entry limits on free plan']
    },
    {
      id: 'strapi',
      name: 'Strapi',
      description: 'Open-source headless CMS',
      features: ['Self-hosted', 'Plugin system', 'Role-based access', 'GraphQL support'],
      pros: ['Open source', 'Full control', 'Extensible'],
      cons: ['Requires hosting', 'More setup required']
    }
  ]

  const handleConfigChange = (cms, field, value) => {
    setCmsConfig(prev => ({
      ...prev,
      [cms]: {
        ...prev[cms],
        [field]: value
      }
    }))
  }

  const testConnection = async (cms) => {
    setIsConnecting(true)
    
    try {
      const config = cmsConfig[cms]
      let isValid = false
      
      switch (cms) {
        case 'sanity':
          isValid = await testSanityConnection(config)
          break
        case 'contentful':
          isValid = await testContentfulConnection(config)
          break
        case 'strapi':
          isValid = await testStrapiConnection(config)
          break
      }
      
      setConnectionStatus(prev => ({
        ...prev,
        [cms]: isValid ? 'connected' : 'error'
      }))
      
      if (isValid) {
        toast.success(`${cmsOptions.find(c => c.id === cms)?.name} connected successfully!`)
      } else {
        toast.error('Connection failed - please check your configuration')
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [cms]: 'error'
      }))
      toast.error(`Connection failed: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const testSanityConnection = async (config) => {
    if (!config.projectId || !config.dataset) return false
    
    try {
      const response = await fetch(
        `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}?query=*[_type == "post"][0...1]`,
        {
          headers: config.token ? { 'Authorization': `Bearer ${config.token}` } : {}
        }
      )
      return response.ok
    } catch (error) {
      return false
    }
  }

  const testContentfulConnection = async (config) => {
    if (!config.spaceId || !config.accessToken) return false
    
    try {
      const response = await fetch(
        `https://api.contentful.com/spaces/${config.spaceId}/environments/${config.environment}/entries?limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`
          }
        }
      )
      return response.ok
    } catch (error) {
      return false
    }
  }

  const testStrapiConnection = async (config) => {
    if (!config.apiUrl) return false
    
    try {
      const response = await fetch(`${config.apiUrl}/api/articles?pagination[limit]=1`, {
        headers: config.apiToken ? {
          'Authorization': `Bearer ${config.apiToken}`
        } : {}
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const setupWebhooks = async () => {
    try {
      const webhookUrl = `${window.location.origin}/api/webhooks/cms`
      
      switch (selectedCMS) {
        case 'sanity':
          await setupSanityWebhook(webhookUrl)
          break
        case 'contentful':
          await setupContentfulWebhook(webhookUrl)
          break
        case 'strapi':
          await setupStrapiWebhook(webhookUrl)
          break
      }
      
      toast.success('Webhooks configured successfully!')
    } catch (error) {
      toast.error(`Failed to setup webhooks: ${error.message}`)
    }
  }

  const setupSanityWebhook = async (webhookUrl) => {
    const config = cmsConfig.sanity
    
    const webhookConfig = {
      name: 'Portfolio Build Trigger',
      url: webhookUrl,
      trigger: 'create update delete',
      filter: '_type == "post" || _type == "project"',
      secret: 'your-webhook-secret'
    }
    
    // In production, use Sanity's management API to create webhook
    console.log('Sanity webhook configuration:', webhookConfig)
  }

  const setupContentfulWebhook = async (webhookUrl) => {
    const config = cmsConfig.contentful
    
    const webhookConfig = {
      name: 'Portfolio Build Trigger',
      url: webhookUrl,
      topics: ['Entry.publish', 'Entry.unpublish', 'Entry.delete'],
      filters: [{
        equals: [{ doc: 'sys.contentType.sys.id' }, 'blogPost']
      }]
    }
    
    // In production, use Contentful's management API to create webhook
    console.log('Contentful webhook configuration:', webhookConfig)
  }

  const setupStrapiWebhook = async (webhookUrl) => {
    const config = cmsConfig.strapi
    
    const webhookConfig = {
      name: 'Portfolio Build Trigger',
      url: webhookUrl,
      events: ['entry.create', 'entry.update', 'entry.delete'],
      enabled: true
    }
    
    // In production, use Strapi's API to create webhook
    console.log('Strapi webhook configuration:', webhookConfig)
  }

  const triggerBuild = async () => {
    try {
      await buildTrigger()
      toast.success('Build triggered successfully!')
    } catch (error) {
      toast.error(`Build trigger failed: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-cyan-400" size={32} />
          CMS Integration
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={setupWebhooks}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Zap size={16} />
            Setup Webhooks
          </button>
          <button
            onClick={triggerBuild}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Trigger Build
          </button>
        </div>
      </div>

      {/* CMS Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6">Select Headless CMS</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {cmsOptions.map((cms) => (
            <motion.div
              key={cms.id}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                selectedCMS === cms.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
              onClick={() => setSelectedCMS(cms.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{cms.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus[cms.id] === 'connected' ? 'bg-green-500' :
                  connectionStatus[cms.id] === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{cms.description}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-cyan-400 mb-1">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {cms.features.map((feature, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-600 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <h5 className="text-green-400 font-medium mb-1">Pros</h5>
                    <ul className="text-gray-400 space-y-1">
                      {cms.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-red-400 font-medium mb-1">Cons</h5>
                    <ul className="text-gray-400 space-y-1">
                      {cms.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
            <Settings size={20} />
            {cmsOptions.find(c => c.id === selectedCMS)?.name} Configuration
          </h2>
          <button
            onClick={() => testConnection(selectedCMS)}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isConnecting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Database size={16} />
            )}
            Test Connection
          </button>
        </div>

        {selectedCMS === 'sanity' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project ID *
              </label>
              <input
                type="text"
                value={cmsConfig.sanity.projectId}
                onChange={(e) => handleConfigChange('sanity', 'projectId', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="your-project-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dataset
              </label>
              <input
                type="text"
                value={cmsConfig.sanity.dataset}
                onChange={(e) => handleConfigChange('sanity', 'dataset', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="production"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={cmsConfig.sanity.token}
                onChange={(e) => handleConfigChange('sanity', 'token', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Optional for public data"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={cmsConfig.sanity.apiVersion}
                onChange={(e) => handleConfigChange('sanity', 'apiVersion', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="2023-05-03"
              />
            </div>
          </div>
        )}

        {selectedCMS === 'contentful' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Space ID *
              </label>
              <input
                type="text"
                value={cmsConfig.contentful.spaceId}
                onChange={(e) => handleConfigChange('contentful', 'spaceId', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="your-space-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Token *
              </label>
              <input
                type="password"
                value={cmsConfig.contentful.accessToken}
                onChange={(e) => handleConfigChange('contentful', 'accessToken', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Content Delivery API token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preview Token
              </label>
              <input
                type="password"
                value={cmsConfig.contentful.previewToken}
                onChange={(e) => handleConfigChange('contentful', 'previewToken', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Content Preview API token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Environment
              </label>
              <input
                type="text"
                value={cmsConfig.contentful.environment}
                onChange={(e) => handleConfigChange('contentful', 'environment', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="master"
              />
            </div>
          </div>
        )}

        {selectedCMS === 'strapi' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API URL *
              </label>
              <input
                type="url"
                value={cmsConfig.strapi.apiUrl}
                onChange={(e) => handleConfigChange('strapi', 'apiUrl', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="https://your-strapi-instance.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={cmsConfig.strapi.apiToken}
                onChange={(e) => handleConfigChange('strapi', 'apiToken', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Optional for public content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Version
              </label>
              <select
                value={cmsConfig.strapi.version}
                onChange={(e) => handleConfigChange('strapi', 'version', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              >
                <option value="v4">v4 (Latest)</option>
                <option value="v3">v3 (Legacy)</option>
              </select>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content Preview */}
      {connectionStatus[selectedCMS] === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Eye size={20} />
            Content Preview
          </h2>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-300 text-center">
              Content preview will be displayed here once CMS integration is active.
            </p>
          </div>
        </motion.div>
      )}

      {/* Integration Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6">Integration Status</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">CMS Connection</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                connectionStatus[selectedCMS] === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus[selectedCMS] === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {connectionStatus[selectedCMS] === 'connected' ? 'Connected' :
                 connectionStatus[selectedCMS] === 'error' ? 'Error' : 'Not Connected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Webhooks</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                Pending Setup
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Build Automation</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                Ready
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Content Sync</span>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                Inactive
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Media Management</span>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                Not Configured
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-gray-300">Preview Mode</span>
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                Disabled
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CMSIntegration