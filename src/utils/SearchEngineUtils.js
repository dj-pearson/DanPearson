// Search Engine Optimization Utilities
export class SearchEngineUtils {
  constructor() {
    this.searchEngines = {
      google: {
        name: 'Google',
        submitUrl: 'https://www.google.com/ping?sitemap=',
        consoleUrl: 'https://search.google.com/search-console',
        verificationMeta: 'google-site-verification'
      },
      bing: {
        name: 'Bing',
        submitUrl: 'https://www.bing.com/ping?sitemap=',
        consoleUrl: 'https://www.bing.com/webmasters',
        verificationMeta: 'msvalidate.01'
      },
      yandex: {
        name: 'Yandex',
        consoleUrl: 'https://webmaster.yandex.com',
        verificationMeta: 'yandex-verification'
      }
    }
  }
  
  // Submit sitemap to search engines
  async submitSitemap(sitemapUrl) {
    const results = []
    
    for (const [engine, config] of Object.entries(this.searchEngines)) {
      if (!config.submitUrl) continue
      
      try {
        const response = await fetch(config.submitUrl + encodeURIComponent(sitemapUrl), {
          method: 'GET',
          mode: 'no-cors' // Required for cross-origin requests
        })
        
        results.push({
          engine: config.name,
          success: true,
          message: 'Sitemap submitted successfully'
        })
      } catch (error) {
        results.push({
          engine: config.name,
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }
  
  // IndexNow implementation for instant indexing
  async submitToIndexNow(urls, apiKey, host = 'danpearson.com') {
    const indexNowUrl = 'https://api.indexnow.org/indexnow'
    
    const payload = {
      host,
      key: apiKey,
      keyLocation: `https://${host}/${apiKey}.txt`,
      urlList: Array.isArray(urls) ? urls : [urls]
    }
    
    try {
      const response = await fetch(indexNowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      })
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        message: response.ok ? 'URLs submitted to IndexNow successfully' : 'IndexNow submission failed'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  // Generate robots.txt content
  generateRobotsTxt(options = {}) {
    const {
      sitemapUrl = 'https://danpearson.com/sitemap.xml',
      blockAI = true,
      customRules = []
    } = options
    
    let robotsTxt = '# Robots.txt for danpearson.com\n\n'
    
    // Allow all crawlers by default
    robotsTxt += 'User-agent: *\n'
    robotsTxt += 'Allow: /\n\n'
    
    // Block admin areas
    robotsTxt += '# Block admin areas\n'
    robotsTxt += 'Disallow: /admin/\n'
    robotsTxt += 'Disallow: /api/\n'
    robotsTxt += 'Disallow: /private/\n\n'
    
    // Block AI scrapers if requested
    if (blockAI) {
      robotsTxt += '# Block AI scrapers and training bots\n'
      const aiCrawlers = [
        'GPTBot',
        'ChatGPT-User',
        'CCBot',
        'anthropic-ai',
        'Claude-Web',
        'cohere-ai',
        'Omgilibot',
        'FacebookBot',
        'Diffbot',
        'Bytespider',
        'ImagesiftBot'
      ]
      
      aiCrawlers.forEach(bot => {
        robotsTxt += `User-agent: ${bot}\n`
        robotsTxt += 'Disallow: /\n\n'
      })
    }
    
    // Add custom rules
    if (customRules.length > 0) {
      robotsTxt += '# Custom rules\n'
      customRules.forEach(rule => {
        robotsTxt += `${rule}\n`
      })
      robotsTxt += '\n'
    }
    
    // Add sitemap reference
    robotsTxt += `# Sitemap\n`
    robotsTxt += `Sitemap: ${sitemapUrl}\n`
    
    return robotsTxt
  }
  
  // Setup search console verification
  setupSearchConsoleVerification(verificationCodes) {
    Object.entries(verificationCodes).forEach(([engine, code]) => {
      const config = this.searchEngines[engine]
      if (!config) return
      
      // Remove existing verification meta tag
      const existing = document.querySelector(`meta[name="${config.verificationMeta}"]`)
      if (existing) existing.remove()
      
      // Add new verification meta tag
      const meta = document.createElement('meta')
      meta.name = config.verificationMeta
      meta.content = code
      document.head.appendChild(meta)
    })
  }
  
  // Setup Google Analytics 4
  setupGoogleAnalytics(measurementId) {
    // Load gtag script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script1)
    
    // Initialize gtag
    const script2 = document.createElement('script')
    script2.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    `
    document.head.appendChild(script2)
    
    // Make gtag available globally
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
  }
  
  // Setup privacy-first analytics alternative (Plausible)
  setupPlausibleAnalytics(domain) {
    const script = document.createElement('script')
    script.defer = true
    script.setAttribute('data-domain', domain)
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)
  }
  
  // Track custom events
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters)
    }
    
    // Plausible Analytics
    if (typeof plausible !== 'undefined') {
      plausible(eventName, { props: parameters })
    }
    
    // Custom analytics
    this.sendCustomAnalytics(eventName, parameters)
  }
  
  // Send to custom analytics endpoint
  sendCustomAnalytics(eventName, parameters) {
    if (process.env.NODE_ENV !== 'production') return
    
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: eventName,
        parameters,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      })
    }).catch(() => {}) // Fail silently
  }
  
  // Generate meta tags for social sharing
  generateSocialMetaTags(data) {
    const {
      title,
      description,
      image,
      url,
      type = 'website',
      author = 'Dan Pearson',
      twitterHandle = '@danpearson'
    } = data
    
    const metaTags = [
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Dan Pearson' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:creator', content: twitterHandle },
      { name: 'twitter:site', content: twitterHandle }
    ]
    
    // Remove existing meta tags
    metaTags.forEach(tag => {
      const selector = tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`
      const existing = document.querySelector(selector)
      if (existing) existing.remove()
    })
    
    // Add new meta tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta')
      if (tag.property) meta.setAttribute('property', tag.property)
      if (tag.name) meta.setAttribute('name', tag.name)
      meta.content = tag.content
      document.head.appendChild(meta)
    })
  }
  
  // Monitor search engine crawling
  monitorCrawlers() {
    const crawlerPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i, // Yahoo
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i
    ]
    
    const userAgent = navigator.userAgent
    const isCrawler = crawlerPatterns.some(pattern => pattern.test(userAgent))
    
    if (isCrawler) {
      console.log('Search engine crawler detected:', userAgent)
      
      // Track crawler visits
      this.trackEvent('crawler_visit', {
        user_agent: userAgent,
        page: window.location.pathname
      })
    }
    
    return isCrawler
  }
  
  // Generate canonical URL
  setCanonicalUrl(url) {
    // Remove existing canonical link
    const existing = document.querySelector('link[rel="canonical"]')
    if (existing) existing.remove()
    
    // Add new canonical link
    const link = document.createElement('link')
    link.rel = 'canonical'
    link.href = url
    document.head.appendChild(link)
  }
  
  // Setup hreflang for international SEO
  setupHreflang(languages) {
    // Remove existing hreflang links
    document.querySelectorAll('link[rel="alternate"]').forEach(link => {
      if (link.hreflang) link.remove()
    })
    
    // Add hreflang links
    languages.forEach(({ lang, url }) => {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = lang
      link.href = url
      document.head.appendChild(link)
    })
  }
}

export default SearchEngineUtils