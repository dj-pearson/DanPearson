// Sitemap Generation Utility
export class SitemapGenerator {
  constructor(baseUrl = 'https://danpearson.com') {
    this.baseUrl = baseUrl
    this.urls = []
  }
  
  // Add URL to sitemap
  addUrl(url, options = {}) {
    const defaultOptions = {
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString().split('T')[0]
    }
    
    this.urls.push({
      loc: `${this.baseUrl}${url}`,
      ...defaultOptions,
      ...options
    })
  }
  
  // Generate main sitemap
  generateMainSitemap() {
    // Static pages
    this.addUrl('/', { priority: 1.0, changefreq: 'weekly' })
    this.addUrl('/about', { priority: 0.8, changefreq: 'monthly' })
    this.addUrl('/projects', { priority: 0.9, changefreq: 'weekly' })
    this.addUrl('/news', { priority: 0.8, changefreq: 'daily' })
    this.addUrl('/ai-tools', { priority: 0.7, changefreq: 'monthly' })
    this.addUrl('/connect', { priority: 0.6, changefreq: 'monthly' })
    
    // Dynamic blog posts (would be fetched from API in real implementation)
    const blogPosts = [
      {
        slug: 'ai-prompt-engineering-business-success',
        lastmod: '2024-01-15',
        priority: 0.7
      },
      {
        slug: 'future-of-nfts-beyond-digital-art',
        lastmod: '2024-01-10',
        priority: 0.7
      },
      {
        slug: 'sales-leadership-digital-age',
        lastmod: '2024-01-05',
        priority: 0.7
      }
    ]
    
    blogPosts.forEach(post => {
      this.addUrl(`/news/${post.slug}`, {
        priority: post.priority,
        lastmod: post.lastmod,
        changefreq: 'monthly'
      })
    })
    
    return this.generateXML()
  }
  
  // Generate image sitemap
  generateImageSitemap() {
    const images = [
      {
        loc: `${this.baseUrl}/images/dan-pearson-hero.jpg`,
        caption: 'Dan Pearson - Sales Leader and Technology Innovator',
        title: 'Dan Pearson Profile'
      },
      {
        loc: `${this.baseUrl}/images/project-nexus-ai.jpg`,
        caption: 'Project Nexus AI - Generative NFT Collection',
        title: 'Project Nexus AI'
      },
      {
        loc: `${this.baseUrl}/images/ninjoon-collection.jpg`,
        caption: 'Ninjoon NFT Collection - 1,500 Unique Characters',
        title: 'Ninjoon Collection'
      },
      {
        loc: `${this.baseUrl}/images/vidchain-platform.jpg`,
        caption: 'VidChain.io - Blockchain Video Platform',
        title: 'VidChain Platform'
      }
    ]
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    
    // Group images by page
    const pageImages = {
      '/': [images[0]],
      '/projects': images.slice(1)
    }
    
    Object.entries(pageImages).forEach(([page, pageImageList]) => {
      xml += `  <url>\n`
      xml += `    <loc>${this.baseUrl}${page}</loc>\n`
      
      pageImageList.forEach(image => {
        xml += `    <image:image>\n`
        xml += `      <image:loc>${image.loc}</image:loc>\n`
        if (image.caption) xml += `      <image:caption>${image.caption}</image:caption>\n`
        if (image.title) xml += `      <image:title>${image.title}</image:title>\n`
        xml += `    </image:image>\n`
      })
      
      xml += `  </url>\n`
    })
    
    xml += '</urlset>'
    return xml
  }
  
  // Generate XML sitemap
  generateXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    this.urls.forEach(url => {
      xml += '  <url>\n'
      xml += `    <loc>${url.loc}</loc>\n`
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`
      xml += `    <priority>${url.priority}</priority>\n`
      xml += '  </url>\n'
    })
    
    xml += '</urlset>'
    return xml
  }
  
  // Generate sitemap index
  generateSitemapIndex() {
    const sitemaps = [
      {
        loc: `${this.baseUrl}/sitemap.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        loc: `${this.baseUrl}/sitemap-images.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      }
    ]
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    sitemaps.forEach(sitemap => {
      xml += '  <sitemap>\n'
      xml += `    <loc>${sitemap.loc}</loc>\n`
      xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`
      xml += '  </sitemap>\n'
    })
    
    xml += '</sitemapindex>'
    return xml
  }
  
  // Submit sitemap to search engines
  static async submitToSearchEngines(sitemapUrl) {
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ]
    
    const results = []
    
    for (const url of searchEngines) {
      try {
        const response = await fetch(url, { method: 'GET' })
        results.push({
          engine: url.includes('google') ? 'Google' : 'Bing',
          success: response.ok,
          status: response.status
        })
      } catch (error) {
        results.push({
          engine: url.includes('google') ? 'Google' : 'Bing',
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }
  
  // IndexNow implementation for Bing
  static async submitToIndexNow(urls, apiKey) {
    const indexNowUrl = 'https://api.indexnow.org/indexnow'
    
    const payload = {
      host: 'danpearson.com',
      key: apiKey,
      keyLocation: `https://danpearson.com/${apiKey}.txt`,
      urlList: Array.isArray(urls) ? urls : [urls]
    }
    
    try {
      const response = await fetch(indexNowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'URLs submitted successfully' : 'Submission failed'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default SitemapGenerator