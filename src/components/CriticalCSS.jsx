import { useEffect } from 'react'

// Critical CSS Component for above-the-fold content
const CriticalCSS = () => {
  useEffect(() => {
    // Inline critical CSS for immediate rendering
    const criticalStyles = `
      /* Critical CSS for above-the-fold content */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      html {
        font-family: Inter, system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      body {
        background-color: #111827;
        color: #ffffff;
        min-height: 100vh;
      }
      
      /* Navigation */
      nav {
        position: fixed;
        top: 0;
        width: 100%;
        background: rgba(17, 24, 39, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        z-index: 50;
        height: 64px;
      }
      
      /* Hero Section */
      .hero {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      
      .hero-content {
        text-align: center;
        max-width: 1024px;
        padding: 0 1rem;
        position: relative;
        z-index: 20;
      }
      
      .hero-title {
        font-size: clamp(3rem, 8vw, 6rem);
        font-weight: 700;
        margin-bottom: 1.5rem;
        background: linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        line-height: 1.1;
      }
      
      .hero-subtitle {
        font-size: clamp(1.25rem, 3vw, 1.5rem);
        margin-bottom: 2rem;
        color: #e5e7eb;
        font-weight: 500;
      }
      
      .hero-button {
        background: linear-gradient(to right, #06b6d4, #3b82f6);
        padding: 1rem 2rem;
        border-radius: 9999px;
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .hero-button:hover {
        transform: scale(1.05);
        box-shadow: 0 20px 25px -5px rgba(6, 182, 212, 0.5);
      }
      
      /* Loading states */
      .loading-skeleton {
        background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        nav {
          height: 56px;
        }
        
        .hero-content {
          padding: 0 1rem;
        }
      }
      
      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .hero-title {
          background: white;
          background-clip: text;
          -webkit-background-clip: text;
        }
      }
      
      /* Dark mode (default) */
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #111827;
          color: #ffffff;
        }
      }
    `
    
    // Create style element
    const styleElement = document.createElement('style')
    styleElement.id = 'critical-css'
    styleElement.textContent = criticalStyles
    
    // Insert at the beginning of head for highest priority
    document.head.insertBefore(styleElement, document.head.firstChild)
    
    // Load non-critical CSS asynchronously
    const loadNonCriticalCSS = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/css/non-critical.css'
      link.media = 'print'
      link.onload = () => {
        link.media = 'all'
      }
      document.head.appendChild(link)
    }
    
    // Load non-critical CSS after page load
    if (document.readyState === 'complete') {
      loadNonCriticalCSS()
    } else {
      window.addEventListener('load', loadNonCriticalCSS)
    }
    
    return () => {
      const criticalCSS = document.getElementById('critical-css')
      if (criticalCSS) {
        criticalCSS.remove()
      }
    }
  }, [])
  
  return null // This component doesn't render anything visible
}

export default CriticalCSS