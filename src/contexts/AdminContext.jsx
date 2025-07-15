
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseAuthService } from '../utils/SupabaseAuthService'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState([
    {
      id: 1,
      title: "AI Prompt Engineering: The Master Key to Business Success",
      slug: "ai-prompt-engineering-business-success",
      excerpt: "Discover how AI prompts can revolutionize your business operations and learn practical applications across various sectors.",
      content: "Full content of the AI prompt engineering article...",
      category: "AI & Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
      published: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      readTime: "5 min read",
      tags: ["AI", "Business", "Automation"],
      seoTitle: "AI Prompt Engineering Guide 2024 | Business Success Tips",
      seoDescription: "Master AI prompt engineering for business success. Learn practical strategies, best practices, and real-world applications to transform your operations.",
      aiGenerated: false
    }
  ])
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 1250,
    monthlyViews: 340,
    weeklyViews: 85,
    aiGeneratedPosts: 0,
    seoOptimizedPosts: 0
  })
  const [aiSettings, setAISettings] = useState({
    defaultModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    autoSEO: true,
    apiKeys: {
      openai: '',
      claude: '',
      gemini: ''
    }
  })

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check for existing session with proper error handling
      const token = localStorage.getItem('adminToken')
      if (token) {
        const validation = await supabaseAuthService.validateSession(token)
        if (validation.valid && validation.user) {
          setIsAuthenticated(true)
          setUser(validation.user)
        } else {
          // Clean up invalid session
          localStorage.removeItem('adminToken')
          if (token) {
            await supabaseAuthService.destroySession(token)
          }
        }
      }

      // Clean up expired data
      await supabaseAuthService.cleanupExpiredData()

      updateStats()
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      // Authenticate user with email instead of username
      const authResult = await supabaseAuthService.authenticateUser(
        credentials.email,
        credentials.password
      )

      if (!authResult.success) {
        return authResult
      }

      // Create session
      const sessionResult = await supabaseAuthService.createSession(
        authResult.user.id,
        '', // IP address would be captured in production
        navigator.userAgent
      )

      if (!sessionResult.success) {
        return { success: false, error: 'Failed to create session' }
      }

      // Store session token
      localStorage.setItem('adminToken', sessionResult.sessionToken)

      setIsAuthenticated(true)
      setUser(authResult.user)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (token) {
        await supabaseAuthService.destroySession(token)
        localStorage.removeItem('adminToken')
      }

      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const sendPasswordResetEmail = async (email) => {
    try {
      // Generate reset token
      const tokenResult = await supabaseAuthService.generateResetToken(email)
      if (!tokenResult.success) {
        return tokenResult
      }

      const { token } = tokenResult
      const resetLink = `${window.location.origin}/admin/reset-password?token=${token}`

      // For demo purposes, return the reset link
      // In production, this would send an actual email
      console.log('Password reset link:', resetLink)

      return {
        success: true,
        message: 'Password reset email sent successfully',
        resetLink // For demo purposes only
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Failed to send reset email' }
    }
  }

  const validateResetToken = async (token) => {
    try {
      return await supabaseAuthService.validateResetToken(token)
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false, error: 'Invalid token' }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const validation = await supabaseAuthService.validateResetToken(token)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const result = await supabaseAuthService.updatePassword(validation.userId, newPassword)
      if (result.success) {
        await supabaseAuthService.markTokenAsUsed(token)
      }

      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Failed to reset password' }
    }
  }

  const createBlogPost = async (postData) => {
    try {
      const newPost = {
        ...postData,
        id: Date.now(),
        slug: postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seoTitle: postData.seoTitle || postData.title,
        seoDescription: postData.seoDescription || postData.excerpt,
        aiGenerated: postData.aiGenerated || false
      }

      setBlogPosts(prev => [newPost, ...prev])
      updateStats()

      return newPost
    } catch (error) {
      console.error('Failed to create blog post:', error)
      throw error
    }
  }

  const updateBlogPost = async (id, postData) => {
    try {
      setBlogPosts(prev => prev.map(post =>
        post.id === parseInt(id) ? {
          ...post,
          ...postData,
          updatedAt: new Date().toISOString(),
          seoTitle: postData.seoTitle || postData.title,
          seoDescription: postData.seoDescription || postData.excerpt
        } : post
      ))
      updateStats()
    } catch (error) {
      console.error('Failed to update blog post:', error)
      throw error
    }
  }

  const deleteBlogPost = async (id) => {
    try {
      setBlogPosts(prev => prev.filter(post => post.id !== parseInt(id)))
      updateStats()
    } catch (error) {
      console.error('Failed to delete blog post:', error)
      throw error
    }
  }

  const generateAIContent = async (prompt, type, model = aiSettings.defaultModel) => {
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI responses based on type
    const mockResponses = {
      content: `# AI-Generated Article\n\nThis is a comprehensive article generated using ${model}. The content is optimized for engagement and SEO.\n\n## Introduction\n\nArtificial Intelligence continues to reshape how we approach content creation...`,
      title: `AI-Powered ${prompt}: Revolutionary Strategies for 2024`,
      seoTitle: `${prompt} Guide 2024 | Expert AI Insights & Strategies`,
      seoDescription: `Discover cutting-edge ${prompt} strategies powered by AI. Expert insights, practical tips, and proven methods for success in 2024.`,
      excerpt: `Explore the transformative power of ${prompt} with AI-driven insights and practical strategies that deliver real results.`
    }

    return mockResponses[type] || 'Generated content would appear here.'
  }

  const updateAISettings = async (newSettings) => {
    try {
      const updatedSettings = { ...aiSettings, ...newSettings }
      setAISettings(updatedSettings)

      // In production, save to Supabase settings table
      localStorage.setItem('aiSettings', JSON.stringify(updatedSettings))
    } catch (error) {
      console.error('Failed to update AI settings:', error)
      throw error
    }
  }

  const updateStats = () => {
    const total = blogPosts.length
    const published = blogPosts.filter(post => post.published).length
    const drafts = total - published
    const aiGenerated = blogPosts.filter(post => post.aiGenerated).length
    const seoOptimized = blogPosts.filter(post => post.seoTitle && post.seoDescription).length

    setStats(prev => ({
      ...prev,
      totalPosts: total,
      publishedPosts: published,
      draftPosts: drafts,
      aiGeneratedPosts: aiGenerated,
      seoOptimizedPosts: seoOptimized
    }))
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    blogPosts,
    stats,
    aiSettings,
    login,
    logout,
    sendPasswordResetEmail,
    validateResetToken,
    resetPassword,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    generateAIContent,
    updateAISettings
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminProvider
