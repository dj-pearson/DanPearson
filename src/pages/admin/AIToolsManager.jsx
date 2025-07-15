import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  ExternalLink,
  Github,
  Star,
  TrendingUp,
  Calendar,
  Users,
  Zap
} from 'lucide-react'
import AIToolForm from '../../components/admin/AIToolForm'
import { aiToolsService } from '../../utils/aiToolsService'

const AIToolsManager = () => {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'agents', name: 'AI Agents' },
    { id: 'mcp', name: 'MCP Servers' },
    { id: 'emerging', name: 'Emerging Tech' },
    { id: 'development', name: 'Dev Tools' }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'Active', name: 'Active' },
    { id: 'Beta', name: 'Beta' },
    { id: 'Research', name: 'Research' },
    { id: 'Emerging', name: 'Emerging' }
  ]

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      const data = await aiToolsService.getAllTools()
      setTools(data)
    } catch (error) {
      console.error('Error loading tools:', error)
      toast.error('Failed to load AI tools')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTool = () => {
    setEditingTool(null)
    setShowForm(true)
  }

  const handleEditTool = (tool) => {
    setEditingTool(tool)
    setShowForm(true)
  }

  const handleDeleteTool = async (toolId) => {
    if (!confirm('Are you sure you want to delete this AI tool?')) {
      return
    }

    try {
      await aiToolsService.deleteTool(toolId)
      toast.success('AI tool deleted successfully')
      loadTools()
    } catch (error) {
      console.error('Error deleting tool:', error)
      toast.error('Failed to delete AI tool')
    }
  }

  const handleFormSubmit = async (toolData) => {
    try {
      if (editingTool) {
        await aiToolsService.updateTool(editingTool.id, toolData)
        toast.success('AI tool updated successfully')
      } else {
        await aiToolsService.createTool(toolData)
        toast.success('AI tool created successfully')
      }
      setShowForm(false)
      setEditingTool(null)
      loadTools()
    } catch (error) {
      console.error('Error saving tool:', error)
      toast.error('Failed to save AI tool')
    }
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || tool.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Beta': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Research': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Emerging': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Beginner': return 'text-green-400'
      case 'Intermediate': return 'text-yellow-400'
      case 'Advanced': return 'text-orange-400'
      case 'Expert': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (showForm) {
    return (
      <AIToolForm
        tool={editingTool}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false)
          setEditingTool(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="text-cyan-400" size={32} />
            AI Tools Manager
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your AI tools, agents, and emerging technologies
          </p>
        </div>
        <button
          onClick={handleCreateTool}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Tool
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tools</p>
              <p className="text-2xl font-bold text-white">{tools.length}</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-lg">
              <Bot size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tools</p>
              <p className="text-2xl font-bold text-white">
                {tools.filter(t => t.status === 'Active').length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white">
                {new Set(tools.map(t => t.category)).size}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 rounded-lg">
              <Filter size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Beta/Research</p>
              <p className="text-2xl font-bold text-white">
                {tools.filter(t => ['Beta', 'Research', 'Emerging'].includes(t.status)).length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
          >
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Tools Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={tool.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop'}
                  alt={tool.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tool.status)}`}>
                    {tool.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(tool.complexity)}`}>
                    {tool.complexity}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tool.title}
                  </h3>
                  <div className="text-xs text-cyan-400 font-semibold">
                    {tool.pricing}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>

                {/* Features */}
                {tool.features && tool.features.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {tool.features.length > 3 && (
                        <span className="text-xs text-gray-400">+{tool.features.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTool(tool)}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  
                  {tool.link && tool.link !== '#' && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  
                  {tool.github_link && tool.github_link !== '#' && (
                    <a
                      href={tool.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    className="bg-red-600 hover:bg-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {filteredTools.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Bot size={64} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No AI tools found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Get started by adding your first AI tool'}
          </p>
          <button
            onClick={handleCreateTool}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Tool
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default AIToolsManager