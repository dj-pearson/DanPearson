import { SECURITY_CONFIG } from '../config/SecurityConfig'

// Security Middleware Collection
export class SecurityMiddleware {
  // Rate Limiting Implementation
  static createRateLimiter(type = 'general') {
    const config = SECURITY_CONFIG.rateLimits[type]
    const requests = new Map()
    
    return (req, res, next) => {
      const clientId = req.ip || req.connection.remoteAddress
      const now = Date.now()
      const windowStart = now - config.windowMs
      
      // Clean old entries
      if (requests.has(clientId)) {
        const clientRequests = requests.get(clientId).filter(time => time > windowStart)
        requests.set(clientId, clientRequests)
      } else {
        requests.set(clientId, [])
      }
      
      const clientRequests = requests.get(clientId)
      
      if (clientRequests.length >= config.max) {
        return res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000)
        })
      }
      
      clientRequests.push(now)
      next()
    }
  }
  
  // Input Validation and Sanitization
  static validateInput(schema) {
    return (req, res, next) => {
      const errors = []
      
      // Validate required fields
      Object.keys(schema).forEach(field => {
        const rules = schema[field]
        const value = req.body[field]
        
        if (rules.required && (!value || value.trim() === '')) {
          errors.push(`${field} is required`)
          return
        }
        
        if (value) {
          // Length validation
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`)
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must be no more than ${rules.maxLength} characters`)
          }
          
          // Pattern validation
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`)
          }
          
          // Sanitize input
          if (rules.sanitize) {
            req.body[field] = SecurityMiddleware.sanitizeInput(value)
          }
        }
      })
      
      if (errors.length > 0) {
        return res.status(400).json({ errors })
      }
      
      next()
    }
  }
  
  // XSS Protection
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }
  
  // CSRF Protection
  static csrfProtection() {
    const tokens = new Map()
    
    return {
      generateToken: (sessionId) => {
        const token = SecurityMiddleware.generateSecureToken(32)
        tokens.set(sessionId, {
          token,
          expires: Date.now() + (60 * 60 * 1000) // 1 hour
        })
        return token
      },
      
      validateToken: (req, res, next) => {
        const sessionId = req.sessionID
        const providedToken = req.headers['x-csrf-token'] || req.body._csrf
        
        if (!sessionId || !tokens.has(sessionId)) {
          return res.status(403).json({ error: 'CSRF token missing' })
        }
        
        const storedData = tokens.get(sessionId)
        
        if (Date.now() > storedData.expires) {
          tokens.delete(sessionId)
          return res.status(403).json({ error: 'CSRF token expired' })
        }
        
        if (providedToken !== storedData.token) {
          return res.status(403).json({ error: 'CSRF token invalid' })
        }
        
        next()
      }
    }
  }
  
  // File Upload Security
  static secureFileUpload() {
    return (req, res, next) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return next()
      }
      
      const file = req.files.file || req.files[Object.keys(req.files)[0]]
      const config = SECURITY_CONFIG.fileUpload
      
      // Size validation
      if (file.size > config.maxSize) {
        return res.status(400).json({
          error: `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`
        })
      }
      
      // MIME type validation
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'File type not allowed'
        })
      }
      
      // Extension validation
      const extension = '.' + file.name.split('.').pop().toLowerCase()
      if (!config.allowedExtensions.includes(extension)) {
        return res.status(400).json({
          error: 'File extension not allowed'
        })
      }
      
      // Virus scanning simulation (in production, use actual antivirus)
      if (config.virusScanning && SecurityMiddleware.simulateVirusScan(file)) {
        return res.status(400).json({
          error: 'File failed security scan'
        })
      }
      
      next()
    }
  }
  
  // Authentication Middleware
  static requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    try {
      // In production, verify JWT token
      const decoded = SecurityMiddleware.verifyToken(token)
      req.user = decoded
      next()
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
  
  // Authorization Middleware
  static requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      
      next()
    }
  }
  
  // Utility Methods
  static generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  static verifyToken(token) {
    // Mock JWT verification - use actual JWT library in production
    if (token === 'mock-jwt-token-' + new Date().toDateString()) {
      return { id: 1, username: 'admin', role: 'admin' }
    }
    throw new Error('Invalid token')
  }
  
  static simulateVirusScan(file) {
    // Mock virus scan - integrate with actual antivirus in production
    const suspiciousPatterns = ['<script', 'javascript:', 'vbscript:']
    const content = file.data.toString().toLowerCase()
    return suspiciousPatterns.some(pattern => content.includes(pattern))
  }
  
  // Error Handler
  static errorHandler(err, req, res, next) {
    console.error('Security Error:', err)
    
    // Don't expose sensitive error details in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    }
    
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
  }
}

export default SecurityMiddleware