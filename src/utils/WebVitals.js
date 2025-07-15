// Core Web Vitals Monitoring and Optimization
export class WebVitals {
  constructor() {
    this.metrics = {
      LCP: null,
      FID: null,
      CLS: null,
      INP: null,
      TTFB: null,
      FCP: null
    }
    this.observers = []
    this.thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
      TTFB: { good: 800, poor: 1800 },
      FCP: { good: 1800, poor: 3000 }
    }
  }
  
  // Initialize Web Vitals monitoring
  init(callback) {
    this.callback = callback
    this.measureLCP()
    this.measureFID()
    this.measureCLS()
    this.measureINP()
    this.measureTTFB()
    this.measureFCP()
    this.setupPerformanceObserver()
  }
  
  // Largest Contentful Paint
  measureLCP() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.metrics.LCP = {
        value: lastEntry.startTime,
        rating: this.getRating('LCP', lastEntry.startTime),
        element: lastEntry.element,
        timestamp: Date.now()
      }
      
      this.reportMetric('LCP', this.metrics.LCP)
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(observer)
  }
  
  // First Input Delay
  measureFID() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.FID = {
          value: entry.processingStart - entry.startTime,
          rating: this.getRating('FID', entry.processingStart - entry.startTime),
          timestamp: Date.now()
        }
        
        this.reportMetric('FID', this.metrics.FID)
      })
    })
    
    observer.observe({ entryTypes: ['first-input'] })
    this.observers.push(observer)
  }
  
  // Cumulative Layout Shift
  measureCLS() {
    if (!('PerformanceObserver' in window)) return
    
    let clsValue = 0
    let sessionValue = 0
    let sessionEntries = []
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]
          
          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value
            sessionEntries.push(entry)
          } else {
            sessionValue = entry.value
            sessionEntries = [entry]
          }
          
          if (sessionValue > clsValue) {
            clsValue = sessionValue
            
            this.metrics.CLS = {
              value: clsValue,
              rating: this.getRating('CLS', clsValue),
              entries: [...sessionEntries],
              timestamp: Date.now()
            }
            
            this.reportMetric('CLS', this.metrics.CLS)
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(observer)
  }
  
  // Interaction to Next Paint
  measureINP() {
    if (!('PerformanceObserver' in window)) return
    
    let interactions = []
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        interactions.push({
          duration: entry.duration,
          startTime: entry.startTime,
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
          target: entry.target
        })
        
        // Keep only the worst 10 interactions
        interactions.sort((a, b) => b.duration - a.duration)
        interactions = interactions.slice(0, 10)
        
        const inp = this.calculateINP(interactions)
        
        this.metrics.INP = {
          value: inp,
          rating: this.getRating('INP', inp),
          interactions: [...interactions],
          timestamp: Date.now()
        }
        
        this.reportMetric('INP', this.metrics.INP)
      })
    })
    
    observer.observe({ entryTypes: ['event'] })
    this.observers.push(observer)
  }
  
  // Time to First Byte
  measureTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0]
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      
      this.metrics.TTFB = {
        value: ttfb,
        rating: this.getRating('TTFB', ttfb),
        timestamp: Date.now()
      }
      
      this.reportMetric('TTFB', this.metrics.TTFB)
    }
  }
  
  // First Contentful Paint
  measureFCP() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = {
            value: entry.startTime,
            rating: this.getRating('FCP', entry.startTime),
            timestamp: Date.now()
          }
          
          this.reportMetric('FCP', this.metrics.FCP)
        }
      })
    })
    
    observer.observe({ entryTypes: ['paint'] })
    this.observers.push(observer)
  }
  
  // Calculate INP from interactions
  calculateINP(interactions) {
    if (interactions.length === 0) return 0
    
    const durations = interactions.map(i => i.duration).sort((a, b) => a - b)
    const index = Math.min(Math.floor(durations.length * 0.98), durations.length - 1)
    return durations[index]
  }
  
  // Get performance rating
  getRating(metric, value) {
    const thresholds = this.thresholds[metric]
    if (!thresholds) return 'unknown'
    
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }
  
  // Report metric to callback
  reportMetric(name, metric) {
    if (this.callback) {
      this.callback(name, metric)
    }
    
    // Send to analytics
    this.sendToAnalytics(name, metric)
  }
  
  // Send metrics to analytics service
  sendToAnalytics(name, metric) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating,
        custom_parameter_1: window.location.pathname
      })
    }
    
    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value: metric.value,
          rating: metric.rating,
          url: window.location.href,
          timestamp: metric.timestamp,
          userAgent: navigator.userAgent
        })
      }).catch(() => {}) // Fail silently
    }
  }
  
  // Performance observer for resource timing
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        // Monitor slow resources
        if (entry.duration > 1000) {
          console.warn('Slow resource detected:', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          })
        }
        
        // Monitor large resources
        if (entry.transferSize > 1024 * 1024) { // 1MB
          console.warn('Large resource detected:', {
            name: entry.name,
            size: entry.transferSize
          })
        }
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }
  
  // Get current metrics
  getMetrics() {
    return { ...this.metrics }
  }
  
  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
  
  // Optimize LCP
  static optimizeLCP() {
    // Preload LCP image
    const hero = document.querySelector('[data-hero-image]')
    if (hero && hero.src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = hero.src
      document.head.appendChild(link)
    }
    
    // Optimize critical CSS
    const criticalCSS = document.querySelector('#critical-css')
    if (criticalCSS) {
      criticalCSS.media = 'all'
    }
  }
  
  // Optimize CLS
  static optimizeCLS() {
    // Add size attributes to images without them
    const images = document.querySelectorAll('img:not([width]):not([height])')
    images.forEach(img => {
      if (img.naturalWidth && img.naturalHeight) {
        img.width = img.naturalWidth
        img.height = img.naturalHeight
      }
    })
    
    // Reserve space for dynamic content
    const dynamicElements = document.querySelectorAll('[data-dynamic-content]')
    dynamicElements.forEach(el => {
      if (!el.style.minHeight) {
        el.style.minHeight = '200px'
      }
    })
  }
}

export default WebVitals