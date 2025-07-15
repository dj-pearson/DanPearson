import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'
import ImageUpload from '../../components/ImageUpload'
import AIIntegration from '../../components/AIIntegration'
import SEOOptimizer from '../../components/SEOOptimizer'
import { Save, Eye, ArrowLeft, Image, Tag, Calendar, Upload, X, Bot, Sparkles, Search, Zap } from 'lucide-react'

const BlogEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blogPosts, createBlogPost, updateBlogPost } = useAdmin()
  const isEditing = Boolean(id)
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Construction Management',
    image: '',
    published: false,
    tags: [],
    readTime: '5 min read',
    seoTitle: '',
    seoDescription: '',
    targetKeyword: ''
  })
  
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(null)
  const [showSEOOptimizer, setShowSEOOptimizer] = useState(false)
  
  const categories = [
    'Construction Management',
    'Project Planning',
    'Cost Management',
    'Safety & Compliance',
    'Technology & Innovation',
    'Team Management'
  ]
  
  useEffect(() => {
    if (isEditing) {
      const post = blogPosts.find(p => p.id === parseInt(id))
      if (post) {
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content || '',
          category: post.category,
          image: post.image || '',
          published: post.published,
          tags: post.tags || [],
          readTime: post.readTime,
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          targetKeyword: post.targetKeyword || ''
        })
      } else {
        toast.error('Post not found')
        navigate('/admin/blog')
      }
    }
  }, [id, isEditing, blogPosts, navigate])
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const postData = {
        ...formData,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      
      if (isEditing) {
        updateBlogPost(id, postData)
        toast.success('Article updated successfully!')
      } else {
        createBlogPost(postData)
        toast.success('Article created successfully!')
      }
      navigate('/admin/blog')
    } catch (error) {
      toast.error('Failed to save article')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const generateSEOFromContent = () => {
    if (!formData.title) {
      toast.error('Please add a title first')
      return
    }
    
    if (!formData.seoTitle) {
      const seoTitle = formData.title.length > 60 
        ? formData.title.substring(0, 57) + '...'
        : formData.title
      setFormData(prev => ({ ...prev, seoTitle }))
    }
    
    if (!formData.seoDescription) {
      const source = formData.excerpt || formData.content.replace(/<[^>]*>/g, '')
      const seoDescription = source.length > 160
        ? source.substring(0, 157) + '...'
        : source
      setFormData(prev => ({ ...prev, seoDescription }))
    }
    
    toast.success('SEO fields auto-generated!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Article' : 'Create New Article'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={generateSEOFromContent}
            className="px-4 py-2 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors flex items-center gap-2"
          >
            <Zap size={18} />
            Auto SEO
          </button>
          <button
            form="blog-form"
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Publish')}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white text-lg"
                placeholder="Enter article title..."
              />
            </div>
            
            {/* Excerpt */}
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white resize-none"
                placeholder="Brief description of the article..."
              />
            </div>
            
            {/* Content */}
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                name="content"
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white resize-none font-mono text-sm"
                placeholder="Write your article content here... (HTML supported)"
              />
              <p className="text-xs text-gray-400 mt-2">
                Supports HTML tags for formatting. Focus on construction management topics and Build Desk features.
              </p>
            </div>
            
            {/* SEO Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <Search size={18} />
                  SEO Optimization
                </h3>
                <button
                  type="button"
                  onClick={generateSEOFromContent}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Bot size={14} />
                  Auto-Generate SEO
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    name="targetKeyword"
                    value={formData.targetKeyword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                    placeholder="construction project management software"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Primary keyword to target for SEO ranking
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Title ({formData.seoTitle.length}/60)
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                    placeholder="SEO-optimized title for search engines..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 50-60 characters for optimal search results
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Description ({formData.seoDescription.length}/160)
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white resize-none"
                    placeholder="Compelling meta description for search results..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 150-160 characters to avoid truncation in search results
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Settings */}
          <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Article Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Read Time
                </label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="5 min read"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="published" className="text-sm text-gray-300">
                  Publish immediately
                </label>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <Tag size={18} />
              Tags
            </h3>
            
            <form onSubmit={handleAddTag} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white text-sm"
                  placeholder="Add tag..."
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm border border-gray-600 flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          {formData.image && (
            <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Featured Image Preview</h3>
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogEditor