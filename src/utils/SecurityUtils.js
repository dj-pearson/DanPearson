import { SECURITY_CONFIG } from '../config/SecurityConfig'

// Security Utility Functions
export class SecurityUtils {
  // Password Validation
  static validatePassword(password) {
    const config = SECURITY_CONFIG.password
    const errors = []
    
    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`)
    }
    
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', '123456789', 'password1', 'abc123'
    ]
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: SecurityUtils.calculatePasswordStrength(password)
    }
  }
  
  // Password Strength Calculator
  static calculatePasswordStrength(password) {
    let score = 0
    
    // Length bonus
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    // Pattern penalties
    if (/(..).*\1/.test(password)) score -= 1 // Repeated patterns
    if (/^\d+$/.test(password)) score -= 2 // Only numbers
    if (/^[a-zA-Z]+$/.test(password)) score -= 1 // Only letters
    
    const strength = Math.max(0, Math.min(5, score))
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    
    return {
      score: strength,
      level: levels[strength],
      percentage: (strength / 5) * 100
    }
  }
  
  // Input Sanitization
  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return input
    
    let sanitized = input
    
    // HTML encoding
    if (options.encodeHTML !== false) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
    }
    
    // SQL injection protection
    if (options.preventSQL !== false) {
      const sqlPatterns = [
        /('|(\-\-)|(;)|(\|)|(\*)|(%)|(<)|(>)|(\?)|(\[)|(\])|(\{)|(\})|(\$)|(\+)|(\^))/gi
      ]
      sqlPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '')
      })
    }
    
    // XSS protection
    if (options.preventXSS !== false) {
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onerror=/gi,
        /onclick=/gi
      ]
      xssPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '')
      })
    }
    
    // Trim whitespace
    if (options.trim !== false) {
      sanitized = sanitized.trim()
    }
    
    return sanitized
  }
  
  // Generate Secure Random Token
  static generateSecureToken(length = 32) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Hash Password (client-side hashing for additional security)
  static async hashPassword(password, salt = null) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + (salt || ''))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Validate Email
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const isValid = emailRegex.test(email)
    
    // Additional security checks
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /@.*@/, // Multiple @ symbols
      /\.\./, // Consecutive dots
    ]
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email))
    
    return {
      isValid: isValid && !isSuspicious,
      isSuspicious,
      errors: isValid ? [] : ['Invalid email format']
    }
  }
  
  // Rate Limiting Check (client-side)
  static checkRateLimit(key, limit = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now()
    const storageKey = `rateLimit_${key}`
    
    let attempts = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    // Remove old attempts outside the window
    attempts = attempts.filter(timestamp => now - timestamp < windowMs)
    
    if (attempts.length >= limit) {
      const oldestAttempt = Math.min(...attempts)
      const resetTime = oldestAttempt + windowMs
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(resetTime),
        retryAfter: Math.ceil((resetTime - now) / 1000)
      }
    }
    
    // Add current attempt
    attempts.push(now)
    localStorage.setItem(storageKey, JSON.stringify(attempts))
    
    return {
      allowed: true,
      remaining: limit - attempts.length,
      resetTime: new Date(now + windowMs)
    }
  }
  
  // Secure Local Storage
  static secureStorage = {
    set: (key, value, encrypt = true) => {
      try {
        let data = JSON.stringify(value)
        
        if (encrypt) {
          // Simple encryption for demo - use proper encryption in production
          data = btoa(data)
        }
        
        localStorage.setItem(key, data)
        return true
      } catch (error) {
        console.error('Secure storage set error:', error)
        return false
      }
    },
    
    get: (key, decrypt = true) => {
      try {
        let data = localStorage.getItem(key)
        
        if (!data) return null
        
        if (decrypt) {
          data = atob(data)
        }
        
        return JSON.parse(data)
      } catch (error) {
        console.error('Secure storage get error:', error)
        return null
      }
    },
    
    remove: (key) => {
      localStorage.removeItem(key)
    },
    
    clear: () => {
      localStorage.clear()
    }
  }
  
  // Content Security Policy Violation Reporter
  static setupCSPReporting() {
    document.addEventListener('securitypolicyviolation', (e) => {
      const violation = {
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
        effectiveDirective: e.effectiveDirective,
        originalPolicy: e.originalPolicy,
        referrer: e.referrer,
        statusCode: e.statusCode,
        violatedDirective: e.violatedDirective,
        timestamp: new Date().toISOString()
      }
      
      console.warn('CSP Violation:', violation)
      
      // In production, send to security monitoring service
      // fetch('/api/security/csp-violation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(violation)
      // })
    })
  }
  
  // Initialize Security Monitoring
  static initializeSecurity() {
    // Set up CSP violation reporting
    SecurityUtils.setupCSPReporting()
    
    // Monitor for suspicious activity
    let suspiciousActivity = 0
    
    // Monitor rapid form submissions
    document.addEventListener('submit', () => {
      suspiciousActivity++
      if (suspiciousActivity > 10) {
        console.warn('Suspicious form submission activity detected')
        // In production, implement additional security measures
      }
      
      // Reset counter after 1 minute
      setTimeout(() => suspiciousActivity = Math.max(0, suspiciousActivity - 1), 60000)
    })
    
    // Monitor for console access (potential developer tools usage)
    let devtools = { open: false, orientation: null }
    const threshold = 160
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          console.warn('Developer tools detected - monitoring for security')
        }
      } else {
        devtools.open = false
      }
    }, 500)
  }
}

export default SecurityUtils