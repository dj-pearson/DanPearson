import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-gray-800/50 border border-blue-500/20 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">{project.title}</h3>
        <p className="text-gray-400 mb-4 leading-relaxed">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
          More Info <ExternalLink size={16} />
        </button>
      </div>
    </motion.div>
  )
}

export default ProjectCard