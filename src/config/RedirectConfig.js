// Redirect Configuration
export const REDIRECT_CONFIG = {
  // Server-level redirect patterns (for Nginx/Apache)
  serverRedirects: {
    nginx: {
      // Nginx configuration snippets
      staticRedirects: `
        # Static redirects
        location = /old-blog { return 301 /news; }
        location = /portfolio { return 301 /projects; }
        location = /contact { return 301 /connect; }
        location = /services { return 301 /ai-tools; }
        location = /about-me { return 301 /about; }
        location = /blog { return 301 /news; }
        location = /work { return 301 /projects; }
      `,
      categoryRedirects: `
        # Category redirects
        location ~ ^/category/(.+)$ {
          return 301 /news?category=$1;
        }
      `,
      tagRedirects: `
        # Tag redirects
        location ~ ^/tag/(.+)$ {
          return 301 /news?tag=$1;
        }
      `,
      mediaRedirects: `
        # Media redirects
        location ~ ^/wp-content/uploads/(.+)$ {
          return 301 /images/$1;
        }
        location ~ ^/assets/images/(.+)$ {
          return 301 /images/$1;
        }
      `
    },
    apache: {
      // Apache .htaccess configuration
      htaccess: `
        RewriteEngine On
        
        # Static redirects
        RewriteRule ^old-blog/?$ /news [R=301,L]
        RewriteRule ^portfolio/?$ /projects [R=301,L]
        RewriteRule ^contact/?$ /connect [R=301,L]
        RewriteRule ^services/?$ /ai-tools [R=301,L]
        RewriteRule ^about-me/?$ /about [R=301,L]
        RewriteRule ^blog/?$ /news [R=301,L]
        RewriteRule ^work/?$ /projects [R=301,L]
        
        # Category redirects
        RewriteRule ^category/(.+)/?$ /news?category=$1 [R=301,L]
        
        # Tag redirects
        RewriteRule ^tag/(.+)/?$ /news?tag=$1 [R=301,L]
        
        # Media redirects
        RewriteRule ^wp-content/uploads/(.+)$ /images/$1 [R=301,L]
        RewriteRule ^assets/images/(.+)$ /images/$1 [R=301,L]
        
        # 404 handling
        ErrorDocument 404 /404.html
      `
    }
  },
  
  // Database schema for dynamic redirects
  databaseSchema: {
    table: 'redirects',
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      from_url: 'TEXT NOT NULL UNIQUE',
      to_url: 'TEXT NOT NULL',
      status_code: 'INTEGER DEFAULT 301',
      redirect_type: 'TEXT DEFAULT "manual"',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      hit_count: 'INTEGER DEFAULT 0',
      last_hit: 'DATETIME',
      is_active: 'BOOLEAN DEFAULT 1',
      notes: 'TEXT'
    },
    indexes: [
      'CREATE INDEX idx_from_url ON redirects(from_url)',
      'CREATE INDEX idx_redirect_type ON redirects(redirect_type)',
      'CREATE INDEX idx_is_active ON redirects(is_active)'
    ]
  },
  
  // URL patterns for different redirect types
  urlPatterns: {
    // Blog post patterns
    blogPosts: [
      {
        pattern: '/blog/([0-9]{4})/([0-9]{2})/([0-9]{2})/(.+)/',
        replacement: '/news/$4',
        description: 'WordPress date-based permalinks'
      },
      {
        pattern: '/([0-9]{4})/([0-9]{2})/(.+)/',
        replacement: '/news/$3',
        description: 'Year/month permalinks'
      },
      {
        pattern: '/p=([0-9]+)',
        replacement: '/news/post-$1',
        description: 'WordPress post ID permalinks'
      }
    ],
    
    // Category patterns
    categories: [
      {
        pattern: '/category/(.+)/',
        replacement: '/news?category=$1',
        description: 'Category archive pages'
      },
      {
        pattern: '/cat/([0-9]+)',
        replacement: '/news?cat=$1',
        description: 'Category ID permalinks'
      }
    ],
    
    // Tag patterns
    tags: [
      {
        pattern: '/tag/(.+)/',
        replacement: '/news?tag=$1',
        description: 'Tag archive pages'
      }
    ],
    
    // Media patterns
    media: [
      {
        pattern: '/wp-content/uploads/([0-9]{4})/([0-9]{2})/(.+)',
        replacement: '/images/$1/$2/$3',
        description: 'WordPress media uploads'
      },
      {
        pattern: '/assets/(.+)',
        replacement: '/static/$1',
        description: 'Static assets'
      }
    ]
  },
  
  // Testing configuration
  testing: {
    // URLs to test during bulk validation
    testUrls: [
      '/old-blog',
      '/portfolio',
      '/contact',
      '/services',
      '/about-me',
      '/blog',
      '/work',
      '/category/technology',
      '/category/nft',
      '/tag/ai',
      '/wp-content/uploads/2023/01/image.jpg'
    ],
    
    // Expected responses
    expectedResponses: {
      '/old-blog': { status: 301, location: '/news' },
      '/portfolio': { status: 301, location: '/projects' },
      '/contact': { status: 301, location: '/connect' }
    },
    
    // Performance thresholds
    performance: {
      maxRedirectTime: 100, // milliseconds
      maxRedirectChainLength: 3,
      warningThreshold: 50 // milliseconds
    }
  },
  
  // Monitoring configuration
  monitoring: {
    // Metrics to track
    metrics: [
      'redirect_count',
      'redirect_chains',
      'redirect_errors',
      'redirect_response_time',
      'top_redirected_urls'
    ],
    
    // Alert thresholds
    alerts: {
      redirectChainLength: 3,
      errorRate: 0.05, // 5%
      responseTime: 200 // milliseconds
    },
    
    // Reporting intervals
    reporting: {
      realTime: 60000, // 1 minute
      hourly: 3600000, // 1 hour
      daily: 86400000 // 24 hours
    }
  }
}

export default REDIRECT_CONFIG