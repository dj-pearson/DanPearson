// Security Configuration Constants
export const SECURITY_CONFIG = {
  // SSL/TLS Configuration
  ssl: {
    tlsVersion: '1.3',
    cipherSuites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256'
    ],
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },
  
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Remove in production
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://images.unsplash.com",
      "https://cdn.danpearson.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net"
    ],
    connectSrc: [
      "'self'",
      "https://api.openai.com",
      "https://api.anthropic.com",
      "https://generativelanguage.googleapis.com"
    ],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    upgradeInsecureRequests: true
  },
  
  // Security Headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  },
  
  // Rate Limiting
  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
      message: 'Too many requests, please try again later'
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts, please try again later'
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 30,
      message: 'API rate limit exceeded'
    }
  },
  
  // File Upload Security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    virusScanning: true,
    quarantinePath: '/tmp/quarantine'
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    name: 'sessionId',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    },
    resave: false,
    saveUninitialized: false
  },
  
  // CSRF Protection
  csrf: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  },
  
  // Password Policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    historyCount: 5 // Remember last 5 passwords
  },
  
  // API Security
  api: {
    keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
    encryptionAlgorithm: 'aes-256-gcm',
    hashAlgorithm: 'sha256'
  }
}

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  SECURITY_CONFIG.csp.scriptSrc.push("'unsafe-eval'")
  SECURITY_CONFIG.headers['X-Frame-Options'] = 'SAMEORIGIN'
}

export default SECURITY_CONFIG