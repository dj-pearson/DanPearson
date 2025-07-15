import { useState, useRef, useEffect } from 'react'
import useImageOptimization from '../hooks/useImageOptimization'

const ImageOptimizer = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  priority = false,
  sizes = '100vw',
  quality = 85,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const { generateSrcSet, getOptimizedUrl, supportsWebP, supportsAVIF } = useImageOptimization()
  
  // Generate responsive image URLs
  const generateResponsiveUrls = (baseSrc) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1536]
    const formats = []
    
    if (supportsAVIF) formats.push('avif')
    if (supportsWebP) formats.push('webp')
    formats.push('jpg') // fallback
    
    return {
      srcSet: generateSrcSet(baseSrc, breakpoints, quality),
      formats: formats.map(format => ({
        format,
        srcSet: generateSrcSet(baseSrc, breakpoints, quality, format)
      }))
    }
  }
  
  const { srcSet, formats } = generateResponsiveUrls(src)
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.srcset = img.dataset.srcset
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '50px' }
    )
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [priority])
  
  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = getOptimizedUrl(src, { width, height, quality })
      
      if (supportsWebP) {
        link.type = 'image/webp'
      }
      
      document.head.appendChild(link)
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [priority, src, width, height, quality, supportsWebP, getOptimizedUrl])
  
  const handleLoad = () => {
    setIsLoaded(true)
    
    // Report LCP candidate
    if (priority && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.element === imgRef.current) {
            console.log('LCP candidate loaded:', entry.startTime)
          }
        })
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }
  
  const handleError = () => {
    setHasError(true)
    console.error('Image failed to load:', src)
  }
  
  // Placeholder while loading
  const placeholder = (
    <div 
      className={`bg-gray-200 animate-pulse ${className}`}
      style={{ width, height }}
      aria-label={`Loading ${alt}`}
    />
  )
  
  // Error state
  if (hasError) {
    return (
      <div 
        className={`bg-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
        aria-label="Image failed to load"
      >
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    )
  }
  
  return (
    <>
      {!isLoaded && placeholder}
      
      <picture className={isLoaded ? '' : 'hidden'}>
        {/* Modern formats with srcset */}
        {formats.map(({ format, srcSet: formatSrcSet }) => (
          <source
            key={format}
            type={`image/${format}`}
            srcSet={formatSrcSet}
            sizes={sizes}
          />
        ))}
        
        {/* Fallback image */}
        <img
          ref={imgRef}
          src={priority ? getOptimizedUrl(src, { width, height, quality }) : undefined}
          data-src={!priority ? getOptimizedUrl(src, { width, height, quality }) : undefined}
          srcSet={priority ? srcSet : undefined}
          data-srcset={!priority ? srcSet : undefined}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      </picture>
    </>
  )
}

export default ImageOptimizer