import { useState, useEffect } from 'react'

export const useImageOptimization = () => {
  const [supportsWebP, setSupportsWebP] = useState(false)
  const [supportsAVIF, setSupportsAVIF] = useState(false)
  
  useEffect(() => {
    // Check WebP support
    const checkWebP = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }
    
    // Check AVIF support
    const checkAVIF = () => {
      return new Promise((resolve) => {
        const avif = new Image()
        avif.onload = () => resolve(true)
        avif.onerror = () => resolve(false)
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
      })
    }
    
    setSupportsWebP(checkWebP())
    checkAVIF().then(setSupportsAVIF)
  }, [])
  
  // Generate optimized URL (would integrate with image CDN in production)
  const getOptimizedUrl = (src, options = {}) => {
    const { width, height, quality = 85, format } = options
    
    // For demo purposes, return original URL
    // In production, this would generate URLs for image CDN like Cloudinary, ImageKit, etc.
    if (src.includes('unsplash.com')) {
      let optimizedUrl = src
      
      // Add Unsplash transformations
      const params = new URLSearchParams()
      if (width) params.append('w', width)
      if (height) params.append('h', height)
      if (quality !== 85) params.append('q', quality)
      if (format) params.append('fm', format)
      
      if (params.toString()) {
        optimizedUrl += (src.includes('?') ? '&' : '?') + params.toString()
      }
      
      return optimizedUrl
    }
    
    return src
  }
  
  // Generate srcset for responsive images
  const generateSrcSet = (src, breakpoints, quality = 85, format) => {
    return breakpoints
      .map(width => {
        const url = getOptimizedUrl(src, { width, quality, format })
        return `${url} ${width}w`
      })
      .join(', ')
  }
  
  // Preload critical images
  const preloadImage = (src, options = {}) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = getOptimizedUrl(src, options)
    
    if (supportsAVIF) {
      link.type = 'image/avif'
    } else if (supportsWebP) {
      link.type = 'image/webp'
    }
    
    document.head.appendChild(link)
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }
  
  // Calculate image dimensions maintaining aspect ratio
  const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
    const aspectRatio = originalWidth / originalHeight
    
    let width = originalWidth
    let height = originalHeight
    
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }
    
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  }
  
  return {
    supportsWebP,
    supportsAVIF,
    getOptimizedUrl,
    generateSrcSet,
    preloadImage,
    calculateDimensions
  }
}

export default useImageOptimization