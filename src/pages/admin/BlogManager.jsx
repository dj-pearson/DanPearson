import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../../contexts/AdminContext'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  FileText
} from 'lucide-react'

const BlogManager = () => {
  const { blogPosts, deleteBlogPost } = useAdmin()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'published' && post.published) ||
                           (filterStatus === 'draft' && !post.published)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return 0
    })

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteBlogPost(id)
      toast.success('Article deleted successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Articles Manager</h1>
          <p className="text-gray-400 mt-2">
            Manage construction management articles and Build Desk content
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} />
          New Article
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
          >
            <option value="all">All Articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.published 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  {post.targetKeyword && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      SEO: {post.targetKeyword}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag size={14} />
                    <span>{post.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{post.readTime}</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">Tags:</span>
                      <span className="text-xs">{post.tags.slice(0, 2).join(', ')}</span>
                      {post.tags.length > 2 && <span className="text-xs">+{post.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Link
                  to={`/admin/blog/edit/${post.id}`}
                  className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded-lg transition-all duration-300"
                >
                  <Edit size={18} />
                </Link>
                <Link
                  to={`/news/${post.slug}`}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-all duration-300"
                >
                  <Eye size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first construction management article'}
            </p>
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <Plus size={20} />
              Create First Article
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogManager