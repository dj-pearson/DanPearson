import { motion } from 'framer-motion'
import { useAdmin } from '../../contexts/AdminContext'
import { Link } from 'react-router-dom'
import DashboardStats from '../../components/DashboardStats'
import { 
  TrendingUp, 
  FileText, 
  Eye, 
  Calendar,
  Activity,
  Users,
  ShoppingCart,
  Bot,
  Sparkles,
  Zap
} from 'lucide-react'

const AdminDashboard = () => {
  const { stats, blogPosts } = useAdmin()

  const recentPosts = blogPosts.slice(0, 5)
  
  const quickActions = [
    { 
      icon: FileText, 
      label: 'New Blog Post', 
      path: '/admin/blog/new', 
      color: 'from-green-500 to-emerald-600',
      description: 'Create a new blog post with AI assistance'
    },
    { 
      icon: Bot, 
      label: 'AI Tools', 
      path: '/admin/ai-tools', 
      color: 'from-purple-500 to-violet-600',
      description: 'Configure AI integration settings'
    },
    { 
      icon: Eye, 
      label: 'View Site', 
      path: '/', 
      color: 'from-blue-500 to-indigo-600', 
      external: true,
      description: 'Preview your live website'
    },
    { 
      icon: ShoppingCart, 
      label: 'Store Setup', 
      path: '/admin/store', 
      color: 'from-orange-500 to-red-600', 
      disabled: true,
      description: 'E-commerce functionality (coming soon)'
    }
  ]
  
  const aiFeatures = [
    {
      icon: Sparkles,
      title: 'AI Content Generation',
      description: 'Generate blog posts, titles, and SEO content with AI',
      status: 'active',
      usage: '24 articles generated'
    },
    {
      icon: Zap,
      title: 'SEO Optimization',
      description: 'Automatic SEO titles and meta descriptions',
      status: 'active',
      usage: '18 optimizations'
    },
    {
      icon: Bot,
      title: 'Multi-Model Support',
      description: 'OpenAI, Claude, and Gemini integration',
      status: 'configured',
      usage: 'GPT-4 most used'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's what's happening with your site.
          </p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Activity size={20} />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.disabled ? '#' : action.path}
                target={action.external ? '_blank' : undefined}
                className={`w-full flex items-start gap-3 p-4 rounded-lg transition-all duration-300 group ${
                  action.disabled 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${action.color} hover:shadow-lg text-white`
                }`}
                onClick={action.disabled ? (e) => e.preventDefault() : undefined}
              >
                <action.icon size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{action.label}</span>
                    {action.disabled && <span className="text-xs">(Soon)</span>}
                  </div>
                  <p className="text-xs opacity-90 mt-1">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Blog Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
              <FileText size={20} />
              Recent Blog Posts
            </h2>
            <Link 
              to="/admin/blog"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg group hover:bg-gray-600 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    {post.aiGenerated && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        <Bot size={12} />
                        AI
                      </span>
                    )}
                  </div>
                </div>
                <Link 
                  to={`/admin/blog/edit/${post.id}`}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Edit
                </Link>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No blog posts yet</p>
                <Link 
                  to="/admin/blog/new"
                  className="mt-2 text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                >
                  <Bot size={16} />
                  Create your first AI-powered post
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* AI Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
            <Bot size={20} />
            AI Features
          </h2>
          <Link 
            to="/admin/ai-tools"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Configure AI
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                  <feature.icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      feature.status === 'active' ? 'bg-green-500' :
                      feature.status === 'configured' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-gray-400 capitalize">{feature.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{feature.description}</p>
              <p className="text-xs text-cyan-400">{feature.usage}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">System Status</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Website Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Blog System Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">AI Integration Ready</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Store Setup Pending</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard