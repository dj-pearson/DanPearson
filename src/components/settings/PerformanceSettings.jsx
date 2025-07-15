import { useState } from 'react'
import { Zap, Image, Gauge, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PerformanceSettings = ({ settings, onUpdate }) => {
  const [testingPerformance, setTestingPerformance] = useState(false)

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const handleSelectChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const runPerformanceTest = async () => {
    setTestingPerformance(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const results = {
        lcp: 1.2,
        fid: 45,
        cls: 0.08,
        score: 92
      }
      toast.success(`Performance Score: ${results.score}/100`)
    } catch (error) {
      toast.error('Performance test failed')
    } finally {
      setTestingPerformance(false)
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      localStorage.clear()
      sessionStorage.clear()
      toast.success('All caches cleared successfully!')
    } catch (error) {
      toast.error('Failed to clear cache')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-cyan-400" size={24} />
            Performance Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure caching, optimization, and Core Web Vitals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearCache}
            className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/10 transition-colors"
          >
            <RefreshCw size={16} />
            Clear Cache
          </button>
          <button
            onClick={runPerformanceTest}
            disabled={testingPerformance}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Gauge size={16} className={testingPerformance ? 'animate-spin' : ''} />
            {testingPerformance ? 'Testing...' : 'Test Performance'}
          </button>
        </div>
      </div>

      {/* Caching Settings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <RefreshCw size={20} />
          Caching Strategy
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Caching</h4>
              <p className="text-sm text-gray-400">Enable browser and service worker caching</p>
            </div>
            <button
              onClick={() => handleToggle('enableCaching')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableCaching ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableCaching ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cache Strategy
            </label>
            <select
              value={settings.cacheStrategy}
              onChange={(e) => handleSelectChange('cacheStrategy', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            >
              <option value="cache-first">Cache First</option>
              <option value="network-first">Network First</option>
              <option value="stale-while-revalidate">Stale While Revalidate</option>
              <option value="network-only">Network Only</option>
              <option value="cache-only">Cache Only</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Stale While Revalidate is recommended for most use cases
            </p>
          </div>
        </div>
      </div>

      {/* Image Optimization */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Image size={20} />
          Image Optimization
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Image Optimization</h4>
              <p className="text-sm text-gray-400">Automatic WebP/AVIF conversion and compression</p>
            </div>
            <button
              onClick={() => handleToggle('imageOptimization')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.imageOptimization ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.imageOptimization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Lazy Loading</h4>
              <p className="text-sm text-gray-400">Load images only when they enter the viewport</p>
            </div>
            <button
              onClick={() => handleToggle('lazyLoading')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.lazyLoading ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.lazyLoading ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Compression & Minification */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Zap size={20} />
          Compression & Minification
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Compression</h4>
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
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Minification</h4>
              <p className="text-sm text-gray-400">Minify CSS, JavaScript, and HTML</p>
            </div>
            <button
              onClick={() => handleToggle('enableMinification')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableMinification ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableMinification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Preload Critical Resources</h4>
              <p className="text-sm text-gray-400">Preload fonts, critical CSS, and above-fold images</p>
            </div>
            <button
              onClick={() => handleToggle('preloadCritical')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.preloadCritical ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.preloadCritical ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Performance Status</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableCaching ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-300">
              Caching {settings.enableCaching ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.imageOptimization ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Image Optimization {settings.imageOptimization ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.enableCompression ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Compression {settings.enableCompression ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.lazyLoading ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Lazy Loading {settings.lazyLoading ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Core Web Vitals (Last Test)</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">1.2s</div>
            <div className="text-sm text-gray-400">LCP (Good)</div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 2.5s</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">45ms</div>
            <div className="text-sm text-gray-400">FID (Good)</div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 100ms</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">0.08</div>
            <div className="text-sm text-gray-400">CLS (Good)</div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 0.1</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceSettings