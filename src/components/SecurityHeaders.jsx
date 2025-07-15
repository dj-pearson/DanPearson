import { SECURITY_CONFIG } from '../config/SecurityConfig'

// Security Headers Component for Client-Side Implementation
export const SecurityHeaders = () => {
  // Apply security headers via meta tags (client-side implementation)
  const applySecurityHeaders = () => {
    // Content Security Policy
    const cspContent = Object.entries(SECURITY_CONFIG.csp)
      .map(([directive, sources]) => {
        if (directive === 'upgradeInsecureRequests') {
          return sources ? 'upgrade-insecure-requests' : ''
        }
        const sourceList = Array.isArray(sources) ? sources.join(' ') : sources
        return `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sourceList}`
      })
      .filter(Boolean)
      .join('; ')
    
    // Create or update CSP meta tag
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (!cspMeta) {
      cspMeta = document.createElement('meta')
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy')
      document.head.appendChild(cspMeta)
    }
    cspMeta.setAttribute('content', cspContent)
    
    // Apply other security headers via meta tags where possible
    const securityMetas = [
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      { 'http-equiv': 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
    ]
    
    securityMetas.forEach(meta => {
      let existingMeta = document.querySelector(`meta[http-equiv="${meta['http-equiv']}"]`)
      if (!existingMeta) {
        existingMeta = document.createElement('meta')
        Object.entries(meta).forEach(([key, value]) => {
          existingMeta.setAttribute(key, value)
        })
        document.head.appendChild(existingMeta)
      }
    })
  }
  
  // Initialize security headers on component mount
  React.useEffect(() => {
    applySecurityHeaders()
    
    // Set up HSTS if on HTTPS
    if (window.location.protocol === 'https:') {
      // HSTS is typically set by server, but we can add a reminder
      console.info('HSTS should be configured on the server for maximum security')
    }
    
    // Disable right-click context menu in production for additional security
    if (process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e) => e.preventDefault()
      document.addEventListener('contextmenu', handleContextMenu)
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [])
  
  return null // This component doesn't render anything visible
}

// Security Monitoring Component
export const SecurityMonitor = () => {
  React.useEffect(() => {
    // Monitor for potential XSS attempts
    const monitorXSS = () => {
      const suspiciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onerror=/gi
      ]
      
      const checkElement = (element) => {
        const content = element.innerHTML || element.textContent || ''
        return suspiciousPatterns.some(pattern => pattern.test(content))
      }
      
      // Monitor DOM mutations
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (checkElement(node)) {
                console.warn('Potential XSS attempt detected:', node)
                // In production, report to security monitoring service
              }
            }
          })
        })
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['onclick', 'onload', 'onerror']
      })
      
      return () => observer.disconnect()
    }
    
    // Monitor for clickjacking attempts
    const monitorClickjacking = () => {
      if (window.top !== window.self) {
        console.warn('Page loaded in iframe - potential clickjacking attempt')
        // In production, you might want to break out of the frame
        // window.top.location = window.self.location
      }
    }
    
    // Monitor for mixed content
    const monitorMixedContent = () => {
      if (window.location.protocol === 'https:') {
        const insecureElements = document.querySelectorAll(
          'img[src^="http:"], script[src^="http:"], link[href^="http:"]'
        )
        if (insecureElements.length > 0) {
          console.warn('Mixed content detected:', insecureElements)
        }
      }
    }
    
    const cleanup = monitorXSS()
    monitorClickjacking()
    monitorMixedContent()
    
    return cleanup
  }, [])
  
  return null
}

// CSRF Token Component
export const CSRFToken = ({ onTokenGenerated }) => {
  const [token, setToken] = React.useState('')
  
  React.useEffect(() => {
    // Generate CSRF token
    const generateToken = () => {
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      setToken(token)
      
      // Store token in session storage
      sessionStorage.setItem('csrf-token', token)
      
      if (onTokenGenerated) {
        onTokenGenerated(token)
      }
    }
    
    generateToken()
  }, [])
  
  return (
    <input
      type="hidden"
      name="_csrf"
      value={token}
    />
  )
}

// Secure Form Component
export const SecureForm = ({ children, onSubmit, ...props }) => {
  const [csrfToken, setCsrfToken] = React.useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Add CSRF token to form data
    const formData = new FormData(e.target)
    formData.append('_csrf', csrfToken)
    
    // Add security headers to request
    const headers = {
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    }
    
    if (onSubmit) {
      onSubmit(formData, headers)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} {...props}>
      <CSRFToken onTokenGenerated={setCsrfToken} />
      {children}
    </form>
  )
}

export default SecurityHeaders