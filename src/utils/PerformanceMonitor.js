// Performance Monitoring and Optimization
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isMonitoring = false
  }
  
  // Start performance monitoring
  start() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.setupResourceObserver()
    this.setupNavigationObserver()
    this.setupMemoryMonitoring()
    this.setupNetworkMonitoring()
    this.monitorJavaScriptErrors()
  }
  
  // Resource timing observer
  setupResourceObserver() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        this.analyzeResource(entry)
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }
  
  // Navigation timing observer
  setupNavigationObserver() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        this.analyzeNavigation(entry)
      })
    })
    
    observer.observe({ entryTypes: ['navigation'] })
    this.observers.push(observer)
  }
  
  // Analyze resource performance
  analyzeResource(entry) {
    const analysis = {
      name: entry.name,
      type: this.getResourceType(entry),
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
      timing: {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        connect: entry.connectEnd - entry.connectStart,
        ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart
      }
    }
    
    // Flag slow resources
    if (analysis.duration > 1000) {
      console.warn('Slow resource detected:', analysis)
      this.reportSlowResource(analysis)
    }
    
    // Flag large resources
    if (analysis.size > 1024 * 1024) { // 1MB
      console.warn('Large resource detected:', analysis)
      this.reportLargeResource(analysis)
    }
    
    this.metrics.set(`resource_${Date.now()}`, analysis)
  }
  
  // Analyze navigation performance
  analyzeNavigation(entry) {
    const analysis = {
      type: 'navigation',
      timing: {
        redirect: entry.redirectEnd - entry.redirectStart,
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        connect: entry.connectEnd - entry.connectStart,
        ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart,
        domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
        domComplete: entry.domComplete - entry.domContentLoadedEventStart,
        loadComplete: entry.loadEventEnd - entry.loadEventStart
      },
      metrics: {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
        loadComplete: entry.loadEventEnd - entry.navigationStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      }
    }
    
    this.metrics.set('navigation', analysis)
    this.generatePerformanceReport(analysis)
  }
  
  // Get resource type
  getResourceType(entry) {
    if (entry.initiatorType) return entry.initiatorType
    
    const url = entry.name.toLowerCase()
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font'
    
    return 'other'
  }
  
  // Get First Paint timing
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }
  
  // Get First Contentful Paint timing
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }
  
  // Memory monitoring
  setupMemoryMonitoring() {
    if (!('memory' in performance)) return
    
    const checkMemory = () => {
      const memory = performance.memory
      const memoryInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
      
      // Warn if memory usage is high
      if (memoryInfo.usage > 80) {
        console.warn('High memory usage detected:', memoryInfo)
        this.reportHighMemoryUsage(memoryInfo)
      }
      
      this.metrics.set('memory', memoryInfo)
    }
    
    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000)
    checkMemory() // Initial check
    
    return () => clearInterval(interval)
  }
  
  // Network monitoring
  setupNetworkMonitoring() {
    if (!('connection' in navigator)) return
    
    const connection = navigator.connection
    const networkInfo = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
    
    this.metrics.set('network', networkInfo)
    
    // Monitor connection changes
    connection.addEventListener('change', () => {
      const updatedInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      }
      
      this.metrics.set('network', updatedInfo)
      this.adaptToNetworkConditions(updatedInfo)
    })
  }
  
  // JavaScript error monitoring
  monitorJavaScriptErrors() {
    window.addEventListener('error', (event) => {
      const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      }
      
      console.error('JavaScript error detected:', errorInfo)
      this.reportJavaScriptError(errorInfo)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo = {
        reason: event.reason,
        promise: event.promise,
        timestamp: Date.now()
      }
      
      console.error('Unhandled promise rejection:', errorInfo)
      this.reportPromiseRejection(errorInfo)
    })
  }
  
  // Adapt to network conditions
  adaptToNetworkConditions(networkInfo) {
    if (networkInfo.saveData || networkInfo.effectiveType === 'slow-2g') {
      // Reduce image quality
      document.documentElement.classList.add('low-bandwidth')
      
      // Disable non-essential animations
      document.documentElement.classList.add('reduced-motion')
      
      console.log('Adapted to low bandwidth conditions')
    } else {
      document.documentElement.classList.remove('low-bandwidth', 'reduced-motion')
    }
  }
  
  // Generate performance report
  generatePerformanceReport(navigationData) {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      navigation: navigationData,
      recommendations: this.generateRecommendations(navigationData)
    }
    
    console.log('Performance Report:', report)
    return report
  }
  
  // Generate performance recommendations
  generateRecommendations(data) {
    const recommendations = []
    
    if (data.timing.ttfb > 800) {
      recommendations.push('Consider optimizing server response time (TTFB > 800ms)')
    }
    
    if (data.timing.download > 1000) {
      recommendations.push('Consider enabling compression or reducing resource sizes')
    }
    
    if (data.timing.domProcessing > 2000) {
      recommendations.push('Consider optimizing JavaScript execution and DOM manipulation')
    }
    
    if (data.metrics.firstContentfulPaint > 1800) {
      recommendations.push('Consider optimizing First Contentful Paint (target: <1.8s)')
    }
    
    return recommendations
  }
  
  // Report slow resource
  reportSlowResource(resource) {
    // Send to analytics or monitoring service
    this.sendToAnalytics('slow_resource', resource)
  }
  
  // Report large resource
  reportLargeResource(resource) {
    this.sendToAnalytics('large_resource', resource)
  }
  
  // Report high memory usage
  reportHighMemoryUsage(memoryInfo) {
    this.sendToAnalytics('high_memory_usage', memoryInfo)
  }
  
  // Report JavaScript error
  reportJavaScriptError(errorInfo) {
    this.sendToAnalytics('javascript_error', errorInfo)
  }
  
  // Report promise rejection
  reportPromiseRejection(errorInfo) {
    this.sendToAnalytics('promise_rejection', errorInfo)
  }
  
  // Send data to analytics
  sendToAnalytics(eventType, data) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventType, {
        custom_parameter_1: JSON.stringify(data),
        page_location: window.location.href
      })
    }
    
    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          data,
          timestamp: Date.now(),
          url: window.location.href
        })
      }).catch(() => {}) // Fail silently
    }
  }
  
  // Get current metrics
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
  
  // Stop monitoring
  stop() {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

export default PerformanceMonitor