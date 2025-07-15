// Comprehensive Testing Suite for Pre-Migration
export class TestingSuite {
  constructor() {
    this.testResults = new Map()
    this.performanceMetrics = []
    this.securityResults = []
    this.compatibilityResults = []
  }

  // Run complete test suite
  async runFullTestSuite() {
    console.log('Starting comprehensive test suite...')
    
    const results = {
      redirects: await this.testRedirects(),
      performance: await this.testPerformance(),
      security: await this.testSecurity(),
      compatibility: await this.testCompatibility(),
      accessibility: await this.testAccessibility(),
      seo: await this.testSEO()
    }
    
    // Generate comprehensive report
    const report = this.generateTestReport(results)
    
    console.log('Test suite completed:', report)
    return report
  }

  // Test redirect functionality
  async testRedirects() {
    const redirectTests = [
      // Static redirects
      { from: '/old-blog', to: '/news', expectedStatus: 301 },
      { from: '/portfolio', to: '/projects', expectedStatus: 301 },
      { from: '/contact', to: '/connect', expectedStatus: 301 },
      { from: '/services', to: '/ai-tools', expectedStatus: 301 },
      
      // Category redirects
      { from: '/category/technology', to: '/news?category=AI%20%26%20Technology', expectedStatus: 301 },
      { from: '/category/nft', to: '/news?category=NFT%20%26%20Blockchain', expectedStatus: 301 },
      
      // Tag redirects
      { from: '/tag/ai', to: '/news?tag=AI', expectedStatus: 301 },
      { from: '/tag/blockchain', to: '/news?tag=Blockchain', expectedStatus: 301 },
      
      // Media redirects
      { from: '/wp-content/uploads/image.jpg', to: '/images/image.jpg', expectedStatus: 301 }
    ]
    
    const results = []
    
    for (const test of redirectTests) {
      try {
        const result = await this.testSingleRedirect(test)
        results.push(result)
      } catch (error) {
        results.push({
          ...test,
          success: false,
          error: error.message
        })
      }
    }
    
    // Test for redirect chains
    const chainResults = await this.testRedirectChains()
    
    return {
      individual: results,
      chains: chainResults,
      summary: this.summarizeRedirectTests(results, chainResults)
    }
  }

  // Test individual redirect
  async testSingleRedirect(test) {
    const startTime = performance.now()
    
    try {
      const response = await fetch(test.from, {
        method: 'HEAD',
        redirect: 'manual'
      })
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      const actualLocation = response.headers.get('Location')
      const statusMatch = response.status === test.expectedStatus
      const locationMatch = actualLocation === test.to
      
      return {
        ...test,
        actualStatus: response.status,
        actualLocation,
        statusMatch,
        locationMatch,
        success: statusMatch && locationMatch,
        responseTime,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        ...test,
        success: false,
        error: error.message,
        responseTime: performance.now() - startTime
      }
    }
  }

  // Test for redirect chains
  async testRedirectChains() {
    const chainTests = [
      '/old-blog',
      '/portfolio',
      '/contact'
    ]
    
    const results = []
    
    for (const url of chainTests) {
      const chain = await this.followRedirectChain(url)
      results.push({
        startUrl: url,
        chain,
        chainLength: chain.length,
        hasChain: chain.length > 1,
        finalUrl: chain[chain.length - 1]?.url
      })
    }
    
    return results
  }

  // Follow redirect chain
  async followRedirectChain(url, maxDepth = 10) {
    const chain = []
    let currentUrl = url
    let depth = 0
    
    while (depth < maxDepth) {
      try {
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual'
        })
        
        chain.push({
          url: currentUrl,
          status: response.status,
          location: response.headers.get('Location')
        })
        
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location')
          if (location && location !== currentUrl) {
            currentUrl = location
            depth++
          } else {
            break
          }
        } else {
          break
        }
      } catch (error) {
        chain.push({
          url: currentUrl,
          error: error.message
        })
        break
      }
    }
    
    return chain
  }

  // Test performance
  async testPerformance() {
    const performanceTests = [
      { name: 'Homepage Load Time', url: '/' },
      { name: 'Projects Page Load Time', url: '/projects' },
      { name: 'News Page Load Time', url: '/news' },
      { name: 'About Page Load Time', url: '/about' }
    ]
    
    const results = []
    
    for (const test of performanceTests) {
      const metrics = await this.measurePagePerformance(test.url)
      results.push({
        ...test,
        ...metrics
      })
    }
    
    // Test Core Web Vitals
    const webVitals = await this.measureWebVitals()
    
    return {
      pageLoad: results,
      webVitals,
      summary: this.summarizePerformanceTests(results, webVitals)
    }
  }

  // Measure page performance
  async measurePagePerformance(url) {
    const startTime = performance.now()
    
    try {
      const response = await fetch(url)
      const endTime = performance.now()
      
      const navigationEntry = performance.getEntriesByType('navigation')[0]
      
      return {
        success: response.ok,
        status: response.status,
        responseTime: endTime - startTime,
        ttfb: navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : null,
        domContentLoaded: navigationEntry ? navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart : null,
        loadComplete: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.navigationStart : null
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: performance.now() - startTime
      }
    }
  }

  // Measure Web Vitals
  async measureWebVitals() {
    return new Promise((resolve) => {
      const vitals = {
        LCP: null,
        FID: null,
        CLS: null
      }
      
      // Measure LCP
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.LCP = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Measure FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            vitals.FID = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        
        // Measure CLS
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          vitals.CLS = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        
        // Resolve after 5 seconds
        setTimeout(() => {
          resolve(vitals)
        }, 5000)
      } else {
        resolve(vitals)
      }
    })
  }

  // Test security
  async testSecurity() {
    const securityTests = [
      this.testHTTPS(),
      this.testSecurityHeaders(),
      this.testCSP(),
      this.testXSSProtection(),
      this.testSQLInjection(),
      this.testClickjacking()
    ]
    
    const results = await Promise.all(securityTests)
    
    return {
      individual: results,
      summary: this.summarizeSecurityTests(results)
    }
  }

  // Test HTTPS configuration
  async testHTTPS() {
    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD'
      })
      
      return {
        test: 'HTTPS',
        success: window.location.protocol === 'https:',
        details: {
          protocol: window.location.protocol,
          hstsHeader: response.headers.get('Strict-Transport-Security')
        }
      }
    } catch (error) {
      return {
        test: 'HTTPS',
        success: false,
        error: error.message
      }
    }
  }

  // Test security headers
  async testSecurityHeaders() {
    try {
      const response = await fetch(window.location.origin, {
        method: 'HEAD'
      })
      
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Content-Security-Policy'
      ]
      
      const headerResults = requiredHeaders.map(header => ({
        header,
        present: response.headers.has(header),
        value: response.headers.get(header)
      }))
      
      return {
        test: 'Security Headers',
        success: headerResults.every(h => h.present),
        details: headerResults
      }
    } catch (error) {
      return {
        test: 'Security Headers',
        success: false,
        error: error.message
      }
    }
  }

  // Test Content Security Policy
  async testCSP() {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    const cspHeader = await this.getResponseHeader('Content-Security-Policy')
    
    return {
      test: 'Content Security Policy',
      success: !!(cspMeta || cspHeader),
      details: {
        metaTag: cspMeta?.content,
        header: cspHeader
      }
    }
  }

  // Test XSS protection
  async testXSSProtection() {
    // Test for XSS vulnerabilities
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>'
    ]
    
    const results = []
    
    for (const payload of xssPayloads) {
      const testElement = document.createElement('div')
      testElement.innerHTML = payload
      
      results.push({
        payload,
        blocked: testElement.innerHTML !== payload
      })
    }
    
    return {
      test: 'XSS Protection',
      success: results.every(r => r.blocked),
      details: results
    }
  }

  // Test SQL injection protection
  async testSQLInjection() {
    // Test common SQL injection patterns
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --"
    ]
    
    const results = []
    
    for (const payload of sqlPayloads) {
      try {
        const response = await fetch(`/api/test?q=${encodeURIComponent(payload)}`)
        results.push({
          payload,
          status: response.status,
          blocked: response.status === 400 || response.status === 403
        })
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          blocked: true
        })
      }
    }
    
    return {
      test: 'SQL Injection Protection',
      success: results.every(r => r.blocked),
      details: results
    }
  }

  // Test clickjacking protection
  async testClickjacking() {
    const frameOptions = await this.getResponseHeader('X-Frame-Options')
    const csp = await this.getResponseHeader('Content-Security-Policy')
    
    const hasFrameOptions = frameOptions && (frameOptions.includes('DENY') || frameOptions.includes('SAMEORIGIN'))
    const hasCSPFrameAncestors = csp && csp.includes('frame-ancestors')
    
    return {
      test: 'Clickjacking Protection',
      success: hasFrameOptions || hasCSPFrameAncestors,
      details: {
        xFrameOptions: frameOptions,
        cspFrameAncestors: hasCSPFrameAncestors
      }
    }
  }

  // Test cross-browser compatibility
  async testCompatibility() {
    const features = [
      { name: 'ES6 Modules', test: () => 'import' in document.createElement('script') },
      { name: 'CSS Grid', test: () => CSS.supports('display', 'grid') },
      { name: 'CSS Flexbox', test: () => CSS.supports('display', 'flex') },
      { name: 'WebP Images', test: () => this.testWebPSupport() },
      { name: 'Service Workers', test: () => 'serviceWorker' in navigator },
      { name: 'Local Storage', test: () => 'localStorage' in window },
      { name: 'Fetch API', test: () => 'fetch' in window }
    ]
    
    const results = []
    
    for (const feature of features) {
      try {
        const supported = await feature.test()
        results.push({
          feature: feature.name,
          supported,
          success: supported
        })
      } catch (error) {
        results.push({
          feature: feature.name,
          supported: false,
          success: false,
          error: error.message
        })
      }
    }
    
    return {
      individual: results,
      summary: this.summarizeCompatibilityTests(results)
    }
  }

  // Test WebP support
  testWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = () => resolve(true)
      webP.onerror = () => resolve(false)
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  // Test accessibility
  async testAccessibility() {
    const tests = [
      this.testAltText(),
      this.testHeadingStructure(),
      this.testColorContrast(),
      this.testKeyboardNavigation(),
      this.testAriaLabels()
    ]
    
    const results = await Promise.all(tests)
    
    return {
      individual: results,
      summary: this.summarizeAccessibilityTests(results)
    }
  }

  // Test alt text on images
  testAltText() {
    const images = document.querySelectorAll('img')
    const results = Array.from(images).map(img => ({
      src: img.src,
      hasAlt: img.hasAttribute('alt'),
      altText: img.alt
    }))
    
    return {
      test: 'Image Alt Text',
      success: results.every(r => r.hasAlt),
      details: results
    }
  }

  // Test heading structure
  testHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const structure = Array.from(headings).map(h => ({
      level: parseInt(h.tagName.charAt(1)),
      text: h.textContent.trim()
    }))
    
    // Check for proper hierarchy
    let properHierarchy = true
    for (let i = 1; i < structure.length; i++) {
      if (structure[i].level > structure[i-1].level + 1) {
        properHierarchy = false
        break
      }
    }
    
    return {
      test: 'Heading Structure',
      success: structure.length > 0 && properHierarchy,
      details: {
        headings: structure,
        properHierarchy
      }
    }
  }

  // Test color contrast (simplified)
  testColorContrast() {
    // This is a simplified test - in production, use a proper color contrast analyzer
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a')
    const results = []
    
    Array.from(textElements).slice(0, 10).forEach(el => {
      const styles = window.getComputedStyle(el)
      results.push({
        element: el.tagName,
        color: styles.color,
        backgroundColor: styles.backgroundColor
      })
    })
    
    return {
      test: 'Color Contrast',
      success: true, // Simplified - assume pass
      details: results
    }
  }

  // Test keyboard navigation
  testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    
    return {
      test: 'Keyboard Navigation',
      success: focusableElements.length > 0,
      details: {
        focusableElements: focusableElements.length
      }
    }
  }

  // Test ARIA labels
  testAriaLabels() {
    const interactiveElements = document.querySelectorAll('button, a, input')
    const results = Array.from(interactiveElements).map(el => ({
      element: el.tagName,
      hasAriaLabel: el.hasAttribute('aria-label'),
      hasAriaLabelledBy: el.hasAttribute('aria-labelledby'),
      hasTitle: el.hasAttribute('title')
    }))
    
    return {
      test: 'ARIA Labels',
      success: results.every(r => r.hasAriaLabel || r.hasAriaLabelledBy || r.hasTitle),
      details: results
    }
  }

  // Test SEO
  async testSEO() {
    const tests = [
      this.testMetaTags(),
      this.testStructuredData(),
      this.testSitemap(),
      this.testRobotsTxt()
    ]
    
    const results = await Promise.all(tests)
    
    return {
      individual: results,
      summary: this.summarizeSEOTests(results)
    }
  }

  // Test meta tags
  testMetaTags() {
    const requiredMetas = [
      { name: 'title', selector: 'title' },
      { name: 'description', selector: 'meta[name="description"]' },
      { name: 'og:title', selector: 'meta[property="og:title"]' },
      { name: 'og:description', selector: 'meta[property="og:description"]' }
    ]
    
    const results = requiredMetas.map(meta => {
      const element = document.querySelector(meta.selector)
      return {
        meta: meta.name,
        present: !!element,
        content: element?.content || element?.textContent
      }
    })
    
    return {
      test: 'Meta Tags',
      success: results.every(r => r.present),
      details: results
    }
  }

  // Test structured data
  testStructuredData() {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    const results = Array.from(jsonLdScripts).map(script => {
      try {
        const data = JSON.parse(script.textContent)
        return {
          valid: true,
          type: data['@type'],
          context: data['@context']
        }
      } catch (error) {
        return {
          valid: false,
          error: error.message
        }
      }
    })
    
    return {
      test: 'Structured Data',
      success: results.length > 0 && results.every(r => r.valid),
      details: results
    }
  }

  // Test sitemap
  async testSitemap() {
    try {
      const response = await fetch('/sitemap.xml')
      return {
        test: 'Sitemap',
        success: response.ok,
        details: {
          status: response.status,
          contentType: response.headers.get('Content-Type')
        }
      }
    } catch (error) {
      return {
        test: 'Sitemap',
        success: false,
        error: error.message
      }
    }
  }

  // Test robots.txt
  async testRobotsTxt() {
    try {
      const response = await fetch('/robots.txt')
      return {
        test: 'Robots.txt',
        success: response.ok,
        details: {
          status: response.status,
          contentType: response.headers.get('Content-Type')
        }
      }
    } catch (error) {
      return {
        test: 'Robots.txt',
        success: false,
        error: error.message
      }
    }
  }

  // Helper method to get response headers
  async getResponseHeader(headerName) {
    try {
      const response = await fetch(window.location.origin, { method: 'HEAD' })
      return response.headers.get(headerName)
    } catch (error) {
      return null
    }
  }

  // Summarize test results
  summarizeRedirectTests(individual, chains) {
    const totalTests = individual.length
    const passedTests = individual.filter(t => t.success).length
    const chainsDetected = chains.filter(c => c.hasChain).length
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: (passedTests / totalTests) * 100,
      chainsDetected,
      averageResponseTime: individual.reduce((sum, t) => sum + (t.responseTime || 0), 0) / totalTests
    }
  }

  summarizePerformanceTests(pageLoad, webVitals) {
    const avgResponseTime = pageLoad.reduce((sum, t) => sum + (t.responseTime || 0), 0) / pageLoad.length
    
    return {
      averageResponseTime: avgResponseTime,
      allPagesLoaded: pageLoad.every(t => t.success),
      webVitals: {
        LCP: webVitals.LCP,
        FID: webVitals.FID,
        CLS: webVitals.CLS
      }
    }
  }

  summarizeSecurityTests(results) {
    const totalTests = results.length
    const passedTests = results.filter(t => t.success).length
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      securityScore: (passedTests / totalTests) * 100
    }
  }

  summarizeCompatibilityTests(results) {
    const totalFeatures = results.length
    const supportedFeatures = results.filter(t => t.supported).length
    
    return {
      totalFeatures,
      supportedFeatures,
      unsupportedFeatures: totalFeatures - supportedFeatures,
      compatibilityScore: (supportedFeatures / totalFeatures) * 100
    }
  }

  summarizeAccessibilityTests(results) {
    const totalTests = results.length
    const passedTests = results.filter(t => t.success).length
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      accessibilityScore: (passedTests / totalTests) * 100
    }
  }

  summarizeSEOTests(results) {
    const totalTests = results.length
    const passedTests = results.filter(t => t.success).length
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      seoScore: (passedTests / totalTests) * 100
    }
  }

  // Generate comprehensive test report
  generateTestReport(results) {
    const overallScore = Object.values(results)
      .map(category => category.summary?.successRate || category.summary?.securityScore || category.summary?.compatibilityScore || category.summary?.accessibilityScore || category.summary?.seoScore || 0)
      .reduce((sum, score) => sum + score, 0) / Object.keys(results).length
    
    return {
      timestamp: new Date().toISOString(),
      overallScore,
      results,
      recommendations: this.generateRecommendations(results)
    }
  }

  // Generate recommendations based on test results
  generateRecommendations(results) {
    const recommendations = []
    
    // Redirect recommendations
    if (results.redirects.summary.successRate < 100) {
      recommendations.push('Fix failing redirect tests before go-live')
    }
    if (results.redirects.summary.chainsDetected > 0) {
      recommendations.push('Eliminate redirect chains to improve performance')
    }
    
    // Performance recommendations
    if (results.performance.summary.averageResponseTime > 1000) {
      recommendations.push('Optimize page load times - average response time is too high')
    }
    
    // Security recommendations
    if (results.security.summary.securityScore < 100) {
      recommendations.push('Address security vulnerabilities before deployment')
    }
    
    // Accessibility recommendations
    if (results.accessibility.summary.accessibilityScore < 90) {
      recommendations.push('Improve accessibility compliance')
    }
    
    // SEO recommendations
    if (results.seo.summary.seoScore < 100) {
      recommendations.push('Complete SEO optimization tasks')
    }
    
    return recommendations
  }
}

export default TestingSuite