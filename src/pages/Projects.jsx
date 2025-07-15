import { motion } from 'framer-motion'
import { ExternalLink, Github, Calendar, Users, Zap, Code, Palette, Brain, Database, Globe, Shield, Cpu, Bot, Network } from 'lucide-react'
import { useState } from 'react'

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const projects = [
    {
      id: 1,
      title: "Build Desk",
      category: "business",
      description: "Comprehensive project management and team collaboration platform designed for modern businesses. Features real-time collaboration, task management, and integrated communication tools.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop",
      technologies: ["React", "Node.js", "MongoDB", "Socket.io", "AWS"],
      status: "Active",
      date: "2024",
      features: ["Real-time collaboration", "Task management", "Team communication", "Project analytics"],
      link: "#",
      github: "#",
      metrics: { users: "2.5K+", projects: "850+" }
    },
    {
      id: 2,
      title: "Generative NFT Collection",
      category: "nft",
      description: "Unique 10,000-piece generative NFT collection with mathematical precision and artistic flair. Features dynamic traits, rarity algorithms, and smart contract integration.",
      image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=500&h=300&fit=crop",
      technologies: ["Solidity", "JavaScript", "IPFS", "OpenSea API", "Web3.js"],
      status: "Completed",
      date: "2023",
      features: ["10K unique pieces", "Rarity algorithms", "Smart contracts", "Marketplace integration"],
      link: "#",
      github: "#",
      metrics: { minted: "8.2K", volume: "450 ETH" }
    },
    {
      id: 3,
      title: "AI Content Generator",
      category: "ai",
      description: "Advanced AI-powered content generation platform leveraging GPT-4 and custom models for creating high-quality, SEO-optimized content at scale.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
      technologies: ["OpenAI API", "Python", "FastAPI", "React", "PostgreSQL"],
      status: "Active",
      date: "2024",
      features: ["Multi-model support", "SEO optimization", "Bulk generation", "Custom templates"],
      link: "#",
      github: "#",
      metrics: { content: "50K+", users: "1.2K" }
    },
    {
      id: 4,
      title: "Blockchain Analytics Dashboard",
      category: "blockchain",
      description: "Real-time blockchain analytics platform providing insights into DeFi protocols, NFT markets, and cryptocurrency trends with advanced visualization.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
      technologies: ["Web3.js", "D3.js", "Node.js", "Redis", "GraphQL"],
      status: "Active",
      date: "2024",
      features: ["Real-time data", "Custom alerts", "Portfolio tracking", "Market analysis"],
      link: "#",
      github: "#",
      metrics: { transactions: "1M+", protocols: "200+" }
    },
    {
      id: 5,
      title: "Smart Contract Auditing Tool",
      category: "blockchain",
      description: "Automated smart contract security analysis tool that identifies vulnerabilities, gas optimization opportunities, and best practice violations.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
      technologies: ["Solidity", "Python", "Slither", "Mythril", "Docker"],
      status: "Completed",
      date: "2023",
      features: ["Vulnerability detection", "Gas optimization", "Best practices", "Detailed reports"],
      link: "#",
      github: "#",
      metrics: { audits: "500+", vulnerabilities: "2.1K" }
    },
    {
      id: 6,
      title: "AI-Powered Sales CRM",
      category: "ai",
      description: "Intelligent CRM system with AI-driven lead scoring, automated follow-ups, and predictive analytics to maximize sales performance.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      technologies: ["React", "TensorFlow", "Python", "PostgreSQL", "Redis"],
      status: "Active",
      date: "2024",
      features: ["Lead scoring", "Automated workflows", "Predictive analytics", "Integration APIs"],
      link: "#",
      github: "#",
      metrics: { leads: "25K+", conversion: "+35%" }
    }
  ]

  const categories = [
    { id: 'all', name: 'All Projects', icon: Globe },
    { id: 'business', name: 'Business', icon: Users },
    { id: 'nft', name: 'NFT & Blockchain', icon: Palette },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'blockchain', name: 'Blockchain', icon: Shield }
  ]

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.category === selectedCategory)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'business': return Users
      case 'nft': return Palette
      case 'ai': return Brain
      case 'blockchain': return Shield
      default: return Code
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A showcase of innovative solutions spanning NFT development, AI integration, and business applications.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                <IconComponent size={18} />
                {category.name}
              </button>
            )
          })}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project, index) => {
            const CategoryIcon = getCategoryIcon(project.category)
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-800 rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-500 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                      <CategoryIcon size={12} />
                      {project.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                      <Calendar size={12} />
                      {project.date}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Key Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Key Features</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {project.features.slice(0, 4).map((feature, i) => (
                        <div key={i} className="text-xs text-gray-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs">
                      {Object.entries(project.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-cyan-400 font-semibold">{value}</div>
                          <div className="text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-gray-400 text-xs py-1">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={project.link}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      View Project
                    </a>
                    <a
                      href={project.github}
                      className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Github size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mt-16 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-3xl p-12 border border-cyan-500/30"
        >
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            Have a Project in Mind?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's collaborate to bring your innovative ideas to life with cutting-edge technology and proven expertise.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Start a Project <Zap size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default Projects