import { useEffect, useState } from 'react'
import WebVitals from '../utils/WebVitals'

export const useWebVitals = () => {
  const [metrics, setMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const webVitals = new WebVitals()
    
    const handleMetric = (name, metric) => {
      setMetrics(prev => ({
        ...prev,
        [name]: metric
      }))
      setIsLoading(false)
    }
    
    webVitals.init(handleMetric)
    
    // Optimize on mount
    WebVitals.optimizeLCP()
    WebVitals.optimizeCLS()
    
    return () => {
      webVitals.disconnect()
    }
  }, [])
  
  const getOverallScore = () => {
    const scores = Object.values(metrics).map(metric => {
      switch (metric.rating) {
        case 'good': return 100
        case 'needs-improvement': return 50
        case 'poor': return 0
        default: return 50
      }
    })
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }
  
  return {
    metrics,
    isLoading,
    overallScore: getOverallScore()
  }
}

export default useWebVitals