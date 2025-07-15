// 301 Redirect Management System
export class RedirectManager {
  constructor() {
    this.redirects = new Map()
    this.wildcardRedirects = []
    this.categoryMappings = new Map()
    this.tagMappings = new Map()
    this.mediaMappings = new Map()
    this.redirectChains = new Set()
  }

  // Initialize redirect system
  async init() {
    await this.loadRedirectMappings()
    this.setupClientSideRedirects()
    this.monitorRedirectPerformance()
  }

  // Load redirect mappings from various sources
  async loadRedirectMappings() {
    try {
      // Load from database/API
      const mappings = await this.fetchRedirectMappings()
      
      // Static redirects
      const staticRedirects = {
        '/old-blog': '/news',
        '/portfolio': '/projects',
        '/contact': '/connect',
        '/services': '/ai-tools',
        '/about-me': '/about',
        '/blog': '/news',
        '/work': '/projects'
      }
      
      // Category redirects
      const categoryRedirects = {
        '/category/technology': '/news?category=AI%20%26%20Technology',
        '/category/nft': '/news?category=NFT%20%26%20Blockchain',
        '/category/sales': '/news?category=Sales%20%26%20Leadership',
        '/category/ai': '/news?category=AI%20%26%20Technology'
      }
      
      // Tag redirects
      const tagRedirects = {
        '/tag/artificial-intelligence': '/news?tag=AI',
        '/tag/blockchain': '/news?tag=Blockchain',
        '/tag/nft': '/news?tag=NFT',
        '/tag/sales-leadership': '/news?tag=Sales'
      }
      
      // Media redirects
      const mediaRedirects = {
        '/wp-content/uploads': '/images',
        '/assets/images': '/images',
        '/media': '/images'
      }
      
      // Combine all mappings
      Object.entries(staticRedirects).forEach(([from, to]) => {
        this.addRedirect(from, to, 'static')
      })
      
      Object.entries(categoryRedirects).forEach(([from, to]) => {
        this.categoryMappings.set(from, to)
      })
      
      Object.entries(tagRedirects).forEach(([from, to]) => {
        this.tagMappings.set(from, to)
      })
      
      Object.entries(mediaRedirects).forEach(([from, to]) => {
        this.mediaMappings.set(from, to)
      })
      
      // Dynamic mappings from database
      if (mappings && mappings.length > 0) {
        mappings.forEach(mapping => {
          this.addRedirect(mapping.from, mapping.to, mapping.type, mapping.statusCode)
        })
      }
      
    } catch (error) {
      console.error('Failed to load redirect mappings:', error)
    }
  }

  // Fetch redirect mappings from API/database
  async fetchRedirectMappings() {
    try {
      const response = await fetch('/api/redirects')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn('Could not fetch redirect mappings from API')
    }
    return []
  }

  // Add a redirect mapping
  addRedirect(from, to, type = 'static', statusCode = 301) {
    // Validate redirect
    if (this.validateRedirect(from, to)) {
      this.redirects.set(from, {
        to,
        type,
        statusCode,
        createdAt: Date.now(),
        hitCount: 0
      })
    }
  }

  // Validate redirect to prevent chains and loops
  validateRedirect(from, to) {
    // Check for self-redirect
    if (from === to) {
      console.warn(`Self-redirect detected: ${from} -> ${to}`)
      return false
    }
    
    // Check for redirect chains
    if (this.redirects.has(to)) {
      console.warn(`Redirect chain detected: ${from} -> ${to} -> ${this.redirects.get(to).to}`)
      this.redirectChains.add(from)
      return false
    }
    
    return true
  }

  // Setup client-side redirects
  setupClientSideRedirects() {
    // Handle initial page load redirects
    const currentPath = window.location.pathname
    const redirect = this.findRedirect(currentPath)
    
    if (redirect) {
      this.executeRedirect(currentPath, redirect)
      return
    }
    
    // Setup popstate listener for SPA navigation
    window.addEventListener('popstate', (event) => {
      const path = window.location.pathname
      const redirect = this.findRedirect(path)
      
      if (redirect) {
        this.executeRedirect(path, redirect)
      }
    })
  }

  // Find appropriate redirect for a path
  findRedirect(path) {
    // Exact match
    if (this.redirects.has(path)) {
      return this.redirects.get(path)
    }
    
    // Category redirects
    if (this.categoryMappings.has(path)) {
      return {
        to: this.categoryMappings.get(path),
        type: 'category',
        statusCode: 301
      }
    }
    
    // Tag redirects
    if (this.tagMappings.has(path)) {
      return {
        to: this.tagMappings.get(path),
        type: 'tag',
        statusCode: 301
      }
    }
    
    // Media redirects
    for (const [pattern, replacement] of this.mediaMappings.entries()) {
      if (path.startsWith(pattern)) {
        return {
          to: path.replace(pattern, replacement),
          type: 'media',
          statusCode: 301
        }
      }
    }
    
    // Wildcard patterns
    for (const wildcard of this.wildcardRedirects) {
      if (this.matchWildcard(path, wildcard.pattern)) {
        return {
          to: this.processWildcardRedirect(path, wildcard),
          type: 'wildcard',
          statusCode: wildcard.statusCode || 301
        }
      }
    }
    
    return null
  }

  // Execute redirect
  executeRedirect(from, redirect) {
    // Update hit count
    if (this.redirects.has(from)) {
      this.redirects.get(from).hitCount++
    }
    
    // Log redirect
    console.log(`Redirecting: ${from} -> ${redirect.to} (${redirect.statusCode})`)
    
    // Track redirect analytics
    this.trackRedirect(from, redirect.to, redirect.type)
    
    // Perform redirect
    if (redirect.statusCode === 301 || redirect.statusCode === 302) {
      window.location.replace(redirect.to)
    } else {
      window.location.href = redirect.to
    }
  }

  // Match wildcard patterns
  matchWildcard(path, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(path)
  }

  // Process wildcard redirect
  processWildcardRedirect(path, wildcard) {
    return wildcard.replacement.replace(/\$1/g, path.match(new RegExp(wildcard.pattern.replace(/\*/g, '(.*)')))![1])
  }

  // Track redirect analytics
  trackRedirect(from, to, type) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'redirect', {
        from_url: from,
        to_url: to,
        redirect_type: type
      })
    }
    
    // Custom analytics
    fetch('/api/analytics/redirect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        type,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
    }).catch(() => {})
  }

  // Monitor redirect performance
  monitorRedirectPerformance() {
    setInterval(() => {
      const stats = this.getRedirectStats()
      
      // Log performance metrics
      console.log('Redirect Performance:', stats)
      
      // Send to monitoring service
      this.sendPerformanceMetrics(stats)
    }, 300000) // Every 5 minutes
  }

  // Get redirect statistics
  getRedirectStats() {
    const stats = {
      totalRedirects: this.redirects.size,
      redirectChains: this.redirectChains.size,
      topRedirects: [],
      redirectsByType: {}
    }
    
    // Get top redirects by hit count
    const sortedRedirects = Array.from(this.redirects.entries())
      .sort(([,a], [,b]) => b.hitCount - a.hitCount)
      .slice(0, 10)
    
    stats.topRedirects = sortedRedirects.map(([from, data]) => ({
      from,
      to: data.to,
      hits: data.hitCount,
      type: data.type
    }))
    
    // Count redirects by type
    this.redirects.forEach((data) => {
      stats.redirectsByType[data.type] = (stats.redirectsByType[data.type] || 0) + 1
    })
    
    return stats
  }

  // Send performance metrics
  sendPerformanceMetrics(stats) {
    fetch('/api/monitoring/redirects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...stats,
        timestamp: Date.now()
      })
    }).catch(() => {})
  }

  // Bulk test redirects
  async bulkTestRedirects(urls) {
    const results = []
    
    for (const url of urls) {
      try {
        const result = await this.testRedirect(url)
        results.push(result)
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }

  // Test individual redirect
  async testRedirect(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual'
      })
      
      return {
        url,
        statusCode: response.status,
        redirectUrl: response.headers.get('Location'),
        success: response.status >= 300 && response.status < 400,
        responseTime: performance.now()
      }
    } catch (error) {
      throw new Error(`Failed to test redirect for ${url}: ${error.message}`)
    }
  }

  // Export redirect mappings
  exportRedirects() {
    const exports = {
      static: Object.fromEntries(this.redirects),
      categories: Object.fromEntries(this.categoryMappings),
      tags: Object.fromEntries(this.tagMappings),
      media: Object.fromEntries(this.mediaMappings),
      wildcards: this.wildcardRedirects
    }
    
    return JSON.stringify(exports, null, 2)
  }

  // Import redirect mappings
  importRedirects(data) {
    try {
      const imports = JSON.parse(data)
      
      // Clear existing redirects
      this.redirects.clear()
      this.categoryMappings.clear()
      this.tagMappings.clear()
      this.mediaMappings.clear()
      this.wildcardRedirects = []
      
      // Import new redirects
      if (imports.static) {
        Object.entries(imports.static).forEach(([from, data]) => {
          this.redirects.set(from, data)
        })
      }
      
      if (imports.categories) {
        Object.entries(imports.categories).forEach(([from, to]) => {
          this.categoryMappings.set(from, to)
        })
      }
      
      if (imports.tags) {
        Object.entries(imports.tags).forEach(([from, to]) => {
          this.tagMappings.set(from, to)
        })
      }
      
      if (imports.media) {
        Object.entries(imports.media).forEach(([from, to]) => {
          this.mediaMappings.set(from, to)
        })
      }
      
      if (imports.wildcards) {
        this.wildcardRedirects = imports.wildcards
      }
      
      return true
    } catch (error) {
      console.error('Failed to import redirects:', error)
      return false
    }
  }
}

export default RedirectManager