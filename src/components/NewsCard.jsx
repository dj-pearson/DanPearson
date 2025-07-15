import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'

const NewsCard = ({ article, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-gray-800/50 border border-blue-500/20 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Calendar size={16} />
          <span>{article.date}</span>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-gray-400 mb-4 leading-relaxed">{article.excerpt}</p>
        
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Read More <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  )
}

export default NewsCard