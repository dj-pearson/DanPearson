// Privacy-First Analytics Manager
export class AnalyticsManager {
  constructor() {
    this.providers = new Map()
    this.queue = []
    this.config = {
      respectDNT: true, // Respect Do Not Track
      anonymizeIP: true,
      cookieless: true,
      localStoragePrefix: 'analytics_',
      sessionTimeout: 30 * 60 * 1000 // 30 minutes
    }
    this.session = this.initializeSession()
  }

  // Analytics Providers Configuration
  static PROVIDERS = {
    plausible: {
      name: 'Plausible',
      script: 'https://plausible.io/js/script.js',
      privacy: 'high',
      features: ['Page views', 'Custom events', 'Goals', 'Funnels'],
      gdprCompliant: true,
      cookieless: true
    },
    simpleAnalytics: {
      name: 'Simple Analytics',
      script: 'https://scripts.simpleanalyticscdn.com/latest.js',
      privacy: 'high',
      features: ['Page views', 'Referrers', 'Custom events'],
      gdprCompliant: true,
      cookieless: true
    },
    fathom: {
      name: 'Fathom Analytics',
      script: 'https://cdn.usefathom.com/script.js',
      privacy: 'high',
      features: ['Page views', 'Custom events', 'Uptime monitoring'],
      gdprCompliant: true,
      cookieless: true
    },
    umami: {
      name: 'Umami',
      script: '/umami.js', // Self-hosted
      privacy: 'highest',
      features: ['Page views', 'Custom events', 'Real-time'],
      gdprCompliant: true,
      cookieless: true,
      selfHosted: true
    }
  }

  // Initialize analytics
  async initialize(providers = ['plausible']) {
    // Check Do Not Track
    if (this.config.respectDNT && this.isDNTEnabled()) {
      console.log('Analytics disabled: Do Not Track enabled')
      return
    }

    // Load providers
    for (const provider of providers) {
      await this.loadProvider(provider)
    }

    // Setup automatic tracking
    this.setupPageTracking()
    this.setupPerformanceTracking()
    this.setupErrorTracking()
    this.setupUserEngagement()

    // Process queued events
    this.processQueue()

    console.log('Analytics initialized with providers:', providers)
  }

  // Load analytics provider
  async loadProvider(providerId, config = {}) {
    const provider = AnalyticsManager.PROVIDERS[providerId]
    if (!provider) {
      throw new Error(`Unknown analytics provider: ${providerId}`)
    }

    try {
      // Load script
      await this.loadScript(provider.script, {
        'data-domain': config.domain || window.location.hostname,
        'data-api': config.apiEndpoint,
        defer: true
      })

      this.providers.set(providerId, {
        ...provider,
        config,
        loaded: true
      })

      console.log(`${provider.name} analytics loaded`)
    } catch (error) {
      console.error(`Failed to load ${provider.name}:`, error)
    }
  }

  // Load script with attributes
  loadScript(src, attributes = {}) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined) {
          script.setAttribute(key, value)
        }
      })

      script.onload = resolve
      script.onerror = reject

      document.head.appendChild(script)
    })
  }

  // Check if Do Not Track is enabled
  isDNTEnabled() {
    return navigator.doNotTrack === '1' || 
           navigator.msDoNotTrack === '1' || 
           window.doNotTrack === '1'
  }

  // Initialize session
  initializeSession() {
    const sessionId = this.generateSessionId()
    const session = {
      id: sessionId,
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      }
    }

    this.storeSession(session)
    return session
  }

  // Generate session ID
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Store session data
  storeSession(session) {
    if (this.config.cookieless) {
      localStorage.setItem(
        this.config.localStoragePrefix + 'session',
        JSON.stringify(session)
      )
    }
  }

  // Setup automatic page tracking
  setupPageTracking() {
    // Track initial page view
    this.trackPageView()

    // Track SPA navigation
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      setTimeout(() => this.trackPageView(), 0)
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      setTimeout(() => this.trackPageView(), 0)
    }

    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 0)
    })
  }

  // Setup performance tracking
  setupPerformanceTracking() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.trackEvent('performance', {
          metric: 'LCP',
          value: Math.round(lastEntry.startTime)
        })
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.trackEvent('performance', {
            metric: 'FID',
            value: Math.round(entry.processingStart - entry.startTime)
          })
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.trackEvent('performance', {
          metric: 'CLS',
          value: Math.round(clsValue * 1000) / 1000
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
          this.trackEvent('performance', {
            metric: 'page_load_time',
            value: Math.round(navigation.loadEventEnd - navigation.navigationStart)
          })
        }
      }, 0)
    })
  }

  // Setup error tracking
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', {
        type: 'unhandled_promise_rejection',
        reason: event.reason?.toString()
      })
    })
  }

  // Setup user engagement tracking
  setupUserEngagement() {
    let scrollDepth = 0
    let timeOnPage = 0
    let isActive = true

    // Track scroll depth
    const trackScroll = () => {
      const currentScroll = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      if (currentScroll > scrollDepth) {
        scrollDepth = currentScroll
      }
    }

    window.addEventListener('scroll', trackScroll, { passive: true })

    // Track time on page
    const startTime = Date.now()
    const trackTimeOnPage = () => {
      if (isActive) {
        timeOnPage = Date.now() - startTime
      }
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      isActive = !document.hidden
      if (!isActive) {
        this.trackEvent('engagement', {
          scroll_depth: scrollDepth,
          time_on_page: Math.round(timeOnPage / 1000)
        })
      }
    })

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      trackTimeOnPage()
      this.trackEvent('engagement', {
        scroll_depth: scrollDepth,
        time_on_page: Math.round(timeOnPage / 1000)
      })
    })
  }

  // Track page view
  trackPageView(url = window.location.pathname) {
    this.session.pageViews++
    
    const data = {
      url,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    }

    this.sendToProviders('pageview', data)
    this.storeSession(this.session)
  }

  // Track custom event
  trackEvent(name, properties = {}) {
    this.session.events++
    
    const data = {
      name,
      properties: {
        ...properties,
        session_id: this.session.id,
        timestamp: Date.now()
      }
    }

    this.sendToProviders('event', data)
    this.storeSession(this.session)
  }

  // Track goal/conversion
  trackGoal(goalName, value = null) {
    this.trackEvent('goal', {
      goal: goalName,
      value
    })
  }

  // Send data to analytics providers
  sendToProviders(type, data) {
    if (this.providers.size === 0) {
      this.queue.push({ type, data })
      return
    }

    this.providers.forEach((provider, providerId) => {
      try {
        switch (providerId) {
          case 'plausible':
            if (typeof plausible !== 'undefined') {
              if (type === 'pageview') {
                plausible('pageview')
              } else if (type === 'event') {
                plausible(data.name, { props: data.properties })
              }
            }
            break

          case 'simpleAnalytics':
            if (typeof sa !== 'undefined') {
              if (type === 'pageview') {
                sa('pageview')
              } else if (type === 'event') {
                sa(data.name, data.properties)
              }
            }
            break

          case 'fathom':
            if (typeof fathom !== 'undefined') {
              if (type === 'pageview') {
                fathom.trackPageview()
              } else if (type === 'event') {
                fathom.trackGoal(data.name, data.properties.value || 0)
              }
            }
            break

          case 'umami':
            if (typeof umami !== 'undefined') {
              if (type === 'pageview') {
                umami.trackView(data.url)
              } else if (type === 'event') {
                umami.trackEvent(data.name, data.properties)
              }
            }
            break
        }
      } catch (error) {
        console.error(`Analytics error for ${providerId}:`, error)
      }
    })
  }

  // Process queued events
  processQueue() {
    while (this.queue.length > 0) {
      const { type, data } = this.queue.shift()
      this.sendToProviders(type, data)
    }
  }

  // Get analytics data (for dashboard)
  async getAnalyticsData(timeframe = '30d') {
    // This would typically fetch from your analytics API
    // For demo purposes, return mock data
    return {
      pageviews: {
        total: 12500,
        unique: 8300,
        change: '+15%'
      },
      sessions: {
        total: 9200,
        avgDuration: '2m 34s',
        bounceRate: '32%'
      },
      topPages: [
        { path: '/', views: 3200, percentage: 25.6 },
        { path: '/projects', views: 2100, percentage: 16.8 },
        { path: '/news', views: 1800, percentage: 14.4 },
        { path: '/about', views: 1200, percentage: 9.6 }
      ],
      referrers: [
        { source: 'Direct', visits: 4200, percentage: 45.7 },
        { source: 'Google', visits: 2800, percentage: 30.4 },
        { source: 'LinkedIn', visits: 1200, percentage: 13.0 },
        { source: 'Twitter', visits: 800, percentage: 8.7 }
      ],
      devices: {
        desktop: 65,
        mobile: 30,
        tablet: 5
      },
      countries: [
        { country: 'United States', visits: 4500, percentage: 48.9 },
        { country: 'United Kingdom', visits: 1200, percentage: 13.0 },
        { country: 'Canada', visits: 800, percentage: 8.7 },
        { country: 'Germany', visits: 600, percentage: 6.5 }
      ]
    }
  }

  // Export analytics data
  exportData(format = 'json') {
    const data = {
      session: this.session,
      providers: Array.from(this.providers.keys()),
      config: this.config,
      timestamp: new Date().toISOString()
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(data)
    }

    return data
  }

  // Convert data to CSV
  convertToCSV(data) {
    const headers = Object.keys(data).join(',')
    const values = Object.values(data).map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    ).join(',')
    
    return `${headers}\n${values}`
  }

  // Clear analytics data
  clearData() {
    localStorage.removeItem(this.config.localStoragePrefix + 'session')
    this.session = this.initializeSession()
    console.log('Analytics data cleared')
  }
}

export default AnalyticsManager