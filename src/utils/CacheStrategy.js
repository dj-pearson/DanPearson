// Advanced Caching Strategy Implementation
export class CacheStrategy {
  constructor() {
    this.caches = new Map()
    this.strategies = {
      'cache-first': this.cacheFirst.bind(this),
      'network-first': this.networkFirst.bind(this),
      'stale-while-revalidate': this.staleWhileRevalidate.bind(this),
      'network-only': this.networkOnly.bind(this),
      'cache-only': this.cacheOnly.bind(this)
    }
  }

  // Cache configuration by resource type
  static CONFIG = {
    // Static assets - Cache First (1 year)
    static: {
      strategy: 'cache-first',
      maxAge: 31536000, // 1 year
      maxEntries: 100,
      patterns: [/\.(js|css|woff2?|ttf|eot)$/],
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },

    // Images - Cache First (1 year)
    images: {
      strategy: 'cache-first',
      maxAge: 31536000,
      maxEntries: 200,
      patterns: [/\.(jpg|jpeg|png|gif|webp|avif|svg)$/],
      headers: {
        'Cache-Control': 'public, max-age=31536000'
      }
    },

    // HTML pages - Stale While Revalidate (5 minutes)
    pages: {
      strategy: 'stale-while-revalidate',
      maxAge: 300, // 5 minutes
      maxEntries: 50,
      patterns: [/\.html$/, /\/$/],
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400'
      }
    },

    // API responses - Stale While Revalidate (1 hour)
    api: {
      strategy: 'stale-while-revalidate',
      maxAge: 3600, // 1 hour
      maxEntries: 100,
      patterns: [/\/api\//],
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    },

    // Dynamic content - Network First (5 minutes)
    dynamic: {
      strategy: 'network-first',
      maxAge: 300,
      maxEntries: 30,
      networkTimeout: 3000,
      patterns: [/\/news\//, /\/projects\//],
      headers: {
        'Cache-Control': 'public, max-age=300, must-revalidate'
      }
    }
  }

  // Initialize caching system
  async initialize() {
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker()
    }
    
    this.setupBrowserCache()
    this.setupMemoryCache()
    this.startCacheCleanup()
  }

  // Register service worker for advanced caching
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found')
      })
      
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Setup browser cache headers
  setupBrowserCache() {
    // Intercept fetch requests to add cache headers
    const originalFetch = window.fetch
    
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url
      const cacheConfig = this.getCacheConfig(url)
      
      if (cacheConfig && !init.headers) {
        init.headers = {
          ...init.headers,
          ...cacheConfig.headers
        }
      }
      
      return originalFetch(input, init)
    }
  }

  // Setup in-memory cache
  setupMemoryCache() {
    this.memoryCache = new Map()
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    }
  }

  // Get cache configuration for URL
  getCacheConfig(url) {
    for (const [type, config] of Object.entries(CacheStrategy.CONFIG)) {
      if (config.patterns.some(pattern => pattern.test(url))) {
        return config
      }
    }
    return null
  }

  // Cache First Strategy
  async cacheFirst(request, config) {
    const cachedResponse = await this.getFromCache(request)
    
    if (cachedResponse) {
      this.cacheStats.hits++
      return cachedResponse
    }
    
    this.cacheStats.misses++
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await this.putInCache(request, networkResponse.clone(), config)
    }
    
    return networkResponse
  }

  // Network First Strategy
  async networkFirst(request, config) {
    try {
      const networkResponse = await Promise.race([
        fetch(request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), config.networkTimeout || 3000)
        )
      ])
      
      if (networkResponse.ok) {
        await this.putInCache(request, networkResponse.clone(), config)
      }
      
      return networkResponse
    } catch (error) {
      console.warn('Network failed, falling back to cache:', error)
      const cachedResponse = await this.getFromCache(request)
      
      if (cachedResponse) {
        this.cacheStats.hits++
        return cachedResponse
      }
      
      throw error
    }
  }

  // Stale While Revalidate Strategy
  async staleWhileRevalidate(request, config) {
    const cachedResponse = await this.getFromCache(request)
    
    // Always try to fetch fresh data in background
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        this.putInCache(request, response.clone(), config)
      }
      return response
    }).catch(error => {
      console.warn('Background fetch failed:', error)
    })
    
    if (cachedResponse) {
      this.cacheStats.hits++
      // Return cached response immediately, update in background
      fetchPromise.catch(() => {}) // Prevent unhandled rejection
      return cachedResponse
    }
    
    this.cacheStats.misses++
    // No cached response, wait for network
    return await fetchPromise
  }

  // Network Only Strategy
  async networkOnly(request) {
    return await fetch(request)
  }

  // Cache Only Strategy
  async cacheOnly(request) {
    const cachedResponse = await this.getFromCache(request)
    
    if (cachedResponse) {
      this.cacheStats.hits++
      return cachedResponse
    }
    
    this.cacheStats.misses++
    throw new Error('No cached response available')
  }

  // Get response from cache
  async getFromCache(request) {
    const url = typeof request === 'string' ? request : request.url
    
    // Try memory cache first
    if (this.memoryCache.has(url)) {
      const cached = this.memoryCache.get(url)
      if (Date.now() - cached.timestamp < cached.maxAge * 1000) {
        return cached.response
      } else {
        this.memoryCache.delete(url)
      }
    }
    
    // Try browser cache
    if ('caches' in window) {
      const cache = await caches.open('app-cache-v1')
      return await cache.match(request)
    }
    
    return null
  }

  // Put response in cache
  async putInCache(request, response, config) {
    const url = typeof request === 'string' ? request : request.url
    
    // Store in memory cache for quick access
    this.memoryCache.set(url, {
      response: response.clone(),
      timestamp: Date.now(),
      maxAge: config.maxAge
    })
    
    // Store in browser cache for persistence
    if ('caches' in window) {
      const cache = await caches.open('app-cache-v1')
      await cache.put(request, response.clone())
    }
    
    this.cacheStats.sets++
    this.cleanupCache(config)
  }

  // Cleanup old cache entries
  cleanupCache(config) {
    // Cleanup memory cache
    if (this.memoryCache.size > (config.maxEntries || 100)) {
      const entries = Array.from(this.memoryCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = entries.slice(0, entries.length - config.maxEntries)
      toDelete.forEach(([url]) => {
        this.memoryCache.delete(url)
        this.cacheStats.deletes++
      })
    }
  }

  // Start periodic cache cleanup
  startCacheCleanup() {
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  // Clean up expired cache entries
  cleanupExpiredEntries() {
    const now = Date.now()
    
    for (const [url, cached] of this.memoryCache.entries()) {
      if (now - cached.timestamp > cached.maxAge * 1000) {
        this.memoryCache.delete(url)
        this.cacheStats.deletes++
      }
    }
  }

  // Clear all caches
  async clearCache() {
    // Clear memory cache
    this.memoryCache.clear()
    
    // Clear browser cache
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    console.log('All caches cleared')
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100
    
    return {
      ...this.cacheStats,
      hitRate: isNaN(hitRate) ? 0 : hitRate.toFixed(2),
      memorySize: this.memoryCache.size,
      timestamp: Date.now()
    }
  }

  // Preload critical resources
  async preloadResources(urls) {
    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const config = this.getCacheConfig(url)
          if (config) {
            await this.putInCache(url, response, config)
          }
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error)
      }
    })
    
    await Promise.allSettled(preloadPromises)
    console.log(`Preloaded ${urls.length} resources`)
  }
}

export default CacheStrategy