import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../contexts/AdminContext'
import { Calendar, Clock, Tag, ArrowLeft, Share2, Eye } from 'lucide-react'

const BlogPost = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { blogPosts } = useAdmin()
  
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/news')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            Back to News
          </button>
        </div>
      </div>
    )
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to News
        </motion.button>
        
        <motion.article
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl overflow-hidden border border-cyan-500/20"
        >
          {post.image && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readTime}</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="text-gray-300 leading-relaxed space-y-6">
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <div className="space-y-6">
                    <p>
                      This is where the full blog post content would appear. The content management system allows for rich text editing, images, and multimedia content to create engaging blog posts.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <h2 className="text-2xl font-bold text-cyan-400 mt-8 mb-4">Key Points</h2>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Advanced AI integration capabilities</li>
                      <li>Scalable business solutions</li>
                      <li>Future-proof technology stack</li>
                      <li>Expert consultation and support</li>
                    </ul>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={16} className="text-cyan-400" />
                  <span className="text-gray-400 font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm border border-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                  <Share2 size={18} />
                  Share
                </button>
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye size={16} />
                  <span className="text-sm">1.2k views</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Last updated: {formatDate(post.updatedAt)}
              </div>
            </div>
          </div>
        </motion.article>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl p-8 border border-cyan-500/30"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            Enjoyed this article?
          </h2>
          <p className="text-gray-300 mb-6">
            Subscribe to my newsletter for more insights on AI, NFTs, and business innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BlogPost