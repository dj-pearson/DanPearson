// Comprehensive Monitoring System
export class MonitoringSystem {
  constructor() {
    this.metrics = new Map()
    this.alerts = []
    this.observers = []
    this.config = {
      // Performance thresholds
      performance: {
        lcp: { good: 2500, poor: 4000 },
        fid: { good: 100, poor: 300 },
        cls: { good: 0.1, poor: 0.25 },
        ttfb: { good: 800, poor: 1800 }
      },
      // Uptime monitoring
      uptime: {
        checkInterval: 60000, // 1 minute
        timeout: 10000, // 10 seconds
        endpoints: [
          { url: '/', name: 'Homepage' },
          { url: '/api/health', name: 'API Health' }
        ]
      },
      // Error thresholds
      errors: {
        maxErrorRate: 0.05, // 5%
        alertThreshold: 10, // errors per minute
        criticalThreshold: 50
      }
    }
  }

  // Initialize monitoring
  async initialize() {
    this.setupRealUserMonitoring()
    this.setupPerformanceMonitoring()
    this.setupErrorMonitoring()
    this.setupUptimeMonitoring()
    this.setupSecurityMonitoring()
    this.startReporting()
    
    console.log('Monitoring system initialized')
  }

  // Real User Monitoring (RUM)
  setupRealUserMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          this.recordMetric('rum_page_load', {
            value: navigation.loadEventEnd - navigation.navigationStart,
            url: window.location.pathname,
            timestamp: Date.now()
          })
        }
      }, 0)
    })

    // Track resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Slow resource
            this.recordMetric('rum_slow_resource', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize,
              timestamp: Date.now()
            })
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }

    // Track user interactions
    ['click', 'scroll', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.recordMetric('rum_interaction', {
          type: eventType,
          timestamp: Date.now()
        })
      }, { passive: true })
    })
  }

  // Core Web Vitals monitoring
  setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      const lcp = lastEntry.startTime
      
      this.recordMetric('core_web_vitals_lcp', {
        value: lcp,
        rating: this.getRating('lcp', lcp),
        element: lastEntry.element?.tagName,
        timestamp: Date.now()
      })
      
      if (lcp > this.config.performance.lcp.poor) {
        this.createAlert('performance', `Poor LCP: ${Math.round(lcp)}ms`, 'warning')
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(lcpObserver)

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime
        
        this.recordMetric('core_web_vitals_fid', {
          value: fid,
          rating: this.getRating('fid', fid),
          timestamp: Date.now()
        })
        
        if (fid > this.config.performance.fid.poor) {
          this.createAlert('performance', `Poor FID: ${Math.round(fid)}ms`, 'warning')
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      this.recordMetric('core_web_vitals_cls', {
        value: clsValue,
        rating: this.getRating('cls', clsValue),
        timestamp: Date.now()
      })
      
      if (clsValue > this.config.performance.cls.poor) {
        this.createAlert('performance', `Poor CLS: ${clsValue.toFixed(3)}`, 'warning')
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(clsObserver)
  }

  // Error monitoring
  setupErrorMonitoring() {
    let errorCount = 0
    let errorRate = 0
    
    // JavaScript errors
    window.addEventListener('error', (event) => {
      errorCount++
      
      const errorData = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      }
      
      this.recordMetric('javascript_error', errorData)
      
      if (errorCount > this.config.errors.alertThreshold) {
        this.createAlert('error', `High error rate: ${errorCount} errors`, 'critical')
      }
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorData = {
        reason: event.reason?.toString(),
        promise: event.promise,
        url: window.location.href,
        timestamp: Date.now()
      }
      
      this.recordMetric('promise_rejection', errorData)
    })

    // Network errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        if (!response.ok) {
          this.recordMetric('network_error', {
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: Date.now()
          })
        }
        
        return response
      } catch (error) {
        this.recordMetric('network_error', {
          url: args[0],
          error: error.message,
          timestamp: Date.now()
        })
        throw error
      }
    }

    // Reset error count periodically
    setInterval(() => {
      errorRate = errorCount
      errorCount = 0
    }, 60000) // Every minute
  }

  // Uptime monitoring
  setupUptimeMonitoring() {
    const checkUptime = async () => {
      for (const endpoint of this.config.uptime.endpoints) {
        try {
          const startTime = Date.now()
          const response = await Promise.race([
            fetch(endpoint.url, { method: 'HEAD' }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), this.config.uptime.timeout)
            )
          ])
          const responseTime = Date.now() - startTime
          
          this.recordMetric('uptime_check', {
            endpoint: endpoint.name,
            url: endpoint.url,
            status: response.status,
            responseTime,
            success: response.ok,
            timestamp: Date.now()
          })
          
          if (!response.ok) {
            this.createAlert('uptime', `${endpoint.name} is down (${response.status})`, 'critical')
          }
        } catch (error) {
          this.recordMetric('uptime_check', {
            endpoint: endpoint.name,
            url: endpoint.url,
            error: error.message,
            success: false,
            timestamp: Date.now()
          })
          
          this.createAlert('uptime', `${endpoint.name} is unreachable: ${error.message}`, 'critical')
        }
      }
    }

    // Initial check
    checkUptime()
    
    // Periodic checks
    setInterval(checkUptime, this.config.uptime.checkInterval)
  }

  // Security monitoring
  setupSecurityMonitoring() {
    // Monitor for XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const content = node.innerHTML || node.textContent || ''
            const suspiciousPatterns = [
              /<script[^>]*>.*?<\/script>/gi,
              /javascript:/gi,
              /vbscript:/gi
            ]
            
            if (suspiciousPatterns.some(pattern => pattern.test(content))) {
              this.recordMetric('security_threat', {
                type: 'potential_xss',
                content: content.substring(0, 200),
                timestamp: Date.now()
              })
              
              this.createAlert('security', 'Potential XSS attempt detected', 'critical')
            }
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    this.observers.push(observer)

    // Monitor for suspicious activity
    let rapidClicks = 0
    document.addEventListener('click', () => {
      rapidClicks++
      setTimeout(() => rapidClicks--, 1000)
      
      if (rapidClicks > 20) { // 20 clicks per second
        this.recordMetric('security_threat', {
          type: 'rapid_clicking',
          count: rapidClicks,
          timestamp: Date.now()
        })
      }
    })
  }

  // Record metric
  recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, [])
    }
    
    const metrics = this.metrics.get(type)
    metrics.push(data)
    
    // Keep only last 1000 entries per metric type
    if (metrics.length > 1000) {
      metrics.shift()
    }
  }

  // Create alert
  createAlert(category, message, severity = 'info') {
    const alert = {
      id: Date.now() + Math.random(),
      category,
      message,
      severity,
      timestamp: Date.now(),
      acknowledged: false
    }
    
    this.alerts.push(alert)
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }
    
    console.warn(`[${severity.toUpperCase()}] ${category}: ${message}`)
    
    // Send to external monitoring service
    this.sendAlert(alert)
  }

  // Send alert to external service
  async sendAlert(alert) {
    try {
      // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/monitoring/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      })
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  // Get performance rating
  getRating(metric, value) {
    const thresholds = this.config.performance[metric]
    if (!thresholds) return 'unknown'
    
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  // Start periodic reporting
  startReporting() {
    // Send metrics every 5 minutes
    setInterval(() => {
      this.sendMetricsReport()
    }, 5 * 60 * 1000)
    
    // Send summary every hour
    setInterval(() => {
      this.sendSummaryReport()
    }, 60 * 60 * 1000)
  }

  // Send metrics report
  async sendMetricsReport() {
    const report = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts.filter(a => !a.acknowledged),
      summary: this.generateSummary()
    }
    
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })
    } catch (error) {
      console.error('Failed to send metrics report:', error)
    }
  }

  // Send summary report
  async sendSummaryReport() {
    const summary = this.generateSummary()
    
    try {
      await fetch('/api/monitoring/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      })
    } catch (error) {
      console.error('Failed to send summary report:', error)
    }
  }

  // Generate summary
  generateSummary() {
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    
    const recentMetrics = {}
    this.metrics.forEach((values, key) => {
      recentMetrics[key] = values.filter(v => v.timestamp > oneHourAgo)
    })
    
    return {
      timestamp: now,
      period: '1h',
      totalMetrics: Object.values(recentMetrics).reduce((sum, arr) => sum + arr.length, 0),
      activeAlerts: this.alerts.filter(a => !a.acknowledged).length,
      performance: this.getPerformanceSummary(recentMetrics),
      errors: this.getErrorSummary(recentMetrics),
      uptime: this.getUptimeSummary(recentMetrics)
    }
  }

  // Get performance summary
  getPerformanceSummary(metrics) {
    const lcpMetrics = metrics.core_web_vitals_lcp || []
    const fidMetrics = metrics.core_web_vitals_fid || []
    const clsMetrics = metrics.core_web_vitals_cls || []
    
    return {
      lcp: {
        count: lcpMetrics.length,
        average: lcpMetrics.length > 0 ? 
          lcpMetrics.reduce((sum, m) => sum + m.value, 0) / lcpMetrics.length : 0
      },
      fid: {
        count: fidMetrics.length,
        average: fidMetrics.length > 0 ?
          fidMetrics.reduce((sum, m) => sum + m.value, 0) / fidMetrics.length : 0
      },
      cls: {
        count: clsMetrics.length,
        average: clsMetrics.length > 0 ?
          clsMetrics.reduce((sum, m) => sum + m.value, 0) / clsMetrics.length : 0
      }
    }
  }

  // Get error summary
  getErrorSummary(metrics) {
    const jsErrors = metrics.javascript_error || []
    const networkErrors = metrics.network_error || []
    const promiseRejections = metrics.promise_rejection || []
    
    return {
      javascript: jsErrors.length,
      network: networkErrors.length,
      promises: promiseRejections.length,
      total: jsErrors.length + networkErrors.length + promiseRejections.length
    }
  }

  // Get uptime summary
  getUptimeSummary(metrics) {
    const uptimeChecks = metrics.uptime_check || []
    const successful = uptimeChecks.filter(c => c.success).length
    const total = uptimeChecks.length
    
    return {
      checks: total,
      successful,
      uptime: total > 0 ? (successful / total) * 100 : 100,
      averageResponseTime: total > 0 ?
        uptimeChecks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / total : 0
    }
  }

  // Get current status
  getStatus() {
    return {
      monitoring: true,
      metrics: this.metrics.size,
      alerts: this.alerts.length,
      activeAlerts: this.alerts.filter(a => !a.acknowledged).length,
      observers: this.observers.length
    }
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = Date.now()
    }
  }

  // Stop monitoring
  stop() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
    this.alerts = []
    console.log('Monitoring system stopped')
  }
}

export default MonitoringSystem