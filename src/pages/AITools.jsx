import { motion } from 'framer-motion'
import { Bot, Server, Zap, Brain, Code, Cpu, Network, Database, Shield, Globe, Star, ArrowRight, ExternalLink, Github, Sparkles, Layers, MessageSquare, Workflow, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const AITools = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)

  const categories = [
    { id: 'all', name: 'All Tools', icon: Globe },
    { id: 'agents', name: 'AI Agents', icon: Bot },
    { id: 'mcp', name: 'MCP Servers', icon: Server },
    { id: 'emerging', name: 'Emerging Tech', icon: Sparkles },
    { id: 'development', name: 'Dev Tools', icon: Code }
  ]

  const tools = [
    {
      id: 1,
      title: "Claude Computer Use",
      category: "agents",
      description: "Revolutionary AI agent that can interact with computer interfaces, automate tasks, and perform complex workflows through visual understanding.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
      features: ["Screen interaction", "Task automation", "Visual understanding", "Workflow execution"],
      status: "Active",
      complexity: "Advanced",
      pricing: "API-based",
      link: "https://www.anthropic.com/news/3-5-models-and-computer-use",
      github: "#",
      tags: ["Anthropic", "Computer Vision", "Automation"],
      metrics: { accuracy: "92%", tasks: "500+" }
    },
    {
      id: 2,
      title: "OpenAI Swarm",
      category: "agents",
      description: "Multi-agent orchestration framework for building, deploying, and managing collaborative AI agent systems with advanced coordination capabilities.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop",
      features: ["Multi-agent coordination", "Task delegation", "Real-time collaboration", "Scalable architecture"],
      status: "Beta",
      complexity: "Expert",
      pricing: "Open Source",
      link: "https://github.com/openai/swarm",
      github: "https://github.com/openai/swarm",
      tags: ["OpenAI", "Multi-Agent", "Orchestration"],
      metrics: { agents: "50+", efficiency: "85%" }
    },
    {
      id: 3,
      title: "Cursor AI IDE",
      category: "development",
      description: "Next-generation code editor with built-in AI assistance, intelligent code completion, and natural language programming capabilities.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop",
      features: ["AI code completion", "Natural language queries", "Code generation", "Refactoring assistance"],
      status: "Active",
      complexity: "Intermediate",
      pricing: "Freemium",
      link: "https://cursor.sh",
      github: "#",
      tags: ["IDE", "Code Generation", "Developer Tools"],
      metrics: { users: "100K+", accuracy: "94%" }
    },
    {
      id: 4,
      title: "MCP File System Server",
      category: "mcp",
      description: "Model Context Protocol server for secure file system operations, enabling AI models to interact with local and remote file systems safely.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop",
      features: ["Secure file access", "Permission management", "Cross-platform support", "API integration"],
      status: "Active",
      complexity: "Intermediate",
      pricing: "Open Source",
      link: "https://modelcontextprotocol.io",
      github: "https://github.com/modelcontextprotocol/servers",
      tags: ["MCP", "File System", "Security"],
      metrics: { servers: "25+", uptime: "99.9%" }
    },
    {
      id: 5,
      title: "MCP Database Connector",
      category: "mcp",
      description: "Universal database MCP server supporting PostgreSQL, MySQL, SQLite, and more with secure query execution and schema introspection.",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&h=300&fit=crop",
      features: ["Multi-database support", "Query optimization", "Schema introspection", "Security controls"],
      status: "Active",
      complexity: "Advanced",
      pricing: "Open Source",
      link: "https://modelcontextprotocol.io",
      github: "https://github.com/modelcontextprotocol/servers",
      tags: ["MCP", "Database", "SQL"],
      metrics: { databases: "8+", queries: "1M+" }
    },
    {
      id: 6,
      title: "NotebookLM Audio Overview",
      category: "emerging",
      description: "Google's AI-powered research assistant that generates podcast-style audio discussions from your documents and research materials.",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&h=300&fit=crop",
      features: ["Audio generation", "Document analysis", "Research synthesis", "Interactive discussions"],
      status: "Active",
      complexity: "Beginner",
      pricing: "Free",
      link: "https://notebooklm.google.com",
      github: "#",
      tags: ["Google", "Audio AI", "Research"],
      metrics: { users: "500K+", audio: "10M+ min" }
    },
    {
      id: 7,
      title: "Agentic RAG Systems",
      category: "emerging",
      description: "Next-generation Retrieval-Augmented Generation with autonomous agents for dynamic knowledge retrieval and contextual reasoning.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
      features: ["Dynamic retrieval", "Multi-source integration", "Contextual reasoning", "Self-improving accuracy"],
      status: "Research",
      complexity: "Expert",
      pricing: "Varies",
      link: "#",
      github: "#",
      tags: ["RAG", "Knowledge Graphs", "Reasoning"],
      metrics: { accuracy: "96%", sources: "1000+" }
    },
    {
      id: 8,
      title: "Multimodal AI Workflows",
      category: "emerging",
      description: "Integrated systems combining text, image, audio, and video processing for comprehensive AI-powered content creation and analysis.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&h=300&fit=crop",
      features: ["Cross-modal processing", "Content generation", "Real-time analysis", "Workflow automation"],
      status: "Emerging",
      complexity: "Expert",
      pricing: "Enterprise",
      link: "#",
      github: "#",
      tags: ["Multimodal", "Workflows", "Content AI"],
      metrics: { modalities: "5+", processing: "Real-time" }
    },
    {
      id: 9,
      title: "AI Code Review Agent",
      category: "agents",
      description: "Intelligent code review system that analyzes pull requests, suggests improvements, and ensures code quality standards automatically.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop",
      features: ["Automated reviews", "Quality scoring", "Security analysis", "Performance optimization"],
      status: "Active",
      complexity: "Advanced",
      pricing: "SaaS",
      link: "#",
      github: "#",
      tags: ["Code Review", "Quality Assurance", "DevOps"],
      metrics: { reviews: "50K+", accuracy: "91%" }
    },
    {
      id: 10,
      title: "MCP Web Scraping Server",
      category: "mcp",
      description: "Robust web scraping MCP server with rate limiting, proxy support, and intelligent content extraction for AI model integration.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      features: ["Rate limiting", "Proxy rotation", "Content extraction", "Anti-detection"],
      status: "Active",
      complexity: "Intermediate",
      pricing: "Open Source",
      link: "https://modelcontextprotocol.io",
      github: "https://github.com/modelcontextprotocol/servers",
      tags: ["MCP", "Web Scraping", "Data Extraction"],
      metrics: { sites: "1000+", success: "95%" }
    },
    {
      id: 11,
      title: "Bolt.new AI Full-Stack",
      category: "development",
      description: "Revolutionary AI-powered full-stack development environment that generates, deploys, and maintains complete web applications from natural language.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=300&fit=crop",
      features: ["Full-stack generation", "One-click deploy", "Live editing", "Version control"],
      status: "Active",
      complexity: "Beginner",
      pricing: "Freemium",
      link: "https://bolt.new",
      github: "#",
      tags: ["Full-Stack", "No-Code", "Deployment"],
      metrics: { apps: "100K+", deploy: "< 1 min" }
    },
    {
      id: 12,
      title: "AI Reasoning Engines",
      category: "emerging",
      description: "Advanced reasoning systems that combine symbolic AI with neural networks for complex problem-solving and logical inference.",
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500&h=300&fit=crop",
      features: ["Symbolic reasoning", "Neural integration", "Logic inference", "Problem decomposition"],
      status: "Research",
      complexity: "Expert",
      pricing: "Research",
      link: "#",
      github: "#",
      tags: ["Reasoning", "Symbolic AI", "Logic"],
      metrics: { problems: "Complex", accuracy: "98%" }
    }
  ]

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter(tool => tool.category === selectedCategory)

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'agents': return Bot
      case 'mcp': return Server
      case 'emerging': return Sparkles
      case 'development': return Code
      default: return Zap
    }
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-2xl">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Tools & Technologies
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Explore cutting-edge AI tools, agents, MCP servers, and emerging technologies that are shaping the future of artificial intelligence and development.
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
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                <IconComponent size={18} />
                {category.name}
              </button>
            )
          })}
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTools.map((tool, index) => {
            const CategoryIcon = getCategoryIcon(tool.category)
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredCard(tool.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="bg-gray-800 rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-500 group relative"
              >
                {/* Hover Glow Effect */}
                {hoveredCard === tool.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl" />
                )}

                <div className="relative overflow-hidden">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </span>
                    <span className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                      <CategoryIcon size={12} />
                      {tool.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(tool.complexity)}`}>
                      {tool.complexity}
                    </span>
                  </div>
                </div>

                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {tool.title}
                    </h3>
                    <div className="text-xs text-cyan-400 font-semibold">
                      {tool.pricing}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Key Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-1">
                      <Zap size={14} />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-2 gap-1">
                      {tool.features.slice(0, 4).map((feature, i) => (
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
                      {Object.entries(tool.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-cyan-400 font-semibold">{value}</div>
                          <div className="text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Explore
                    </a>
                    {tool.github !== '#' && (
                      <a
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Github size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Emerging Technologies Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-3xl p-12 border border-cyan-500/30"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-cyan-400" size={32} />
              <h2 className="text-3xl font-bold text-cyan-400">
                What's Next in AI?
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The AI landscape is evolving rapidly. Here are the emerging trends and technologies to watch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Network,
                title: "Agentic Workflows",
                description: "AI agents working together in complex, multi-step processes",
                trend: "+340%"
              },
              {
                icon: Layers,
                title: "Multimodal Integration",
                description: "Seamless combination of text, image, audio, and video AI",
                trend: "+280%"
              },
              {
                icon: Shield,
                title: "AI Safety & Alignment",
                description: "Advanced techniques for safe and controllable AI systems",
                trend: "+190%"
              },
              {
                icon: TrendingUp,
                title: "Edge AI Computing",
                description: "Powerful AI models running directly on devices",
                trend: "+220%"
              }
            ].map((trend, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <trend.icon size={20} className="text-white" />
                  </div>
                  <div className="text-green-400 text-sm font-semibold">
                    {trend.trend}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {trend.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {trend.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            Ready to Build with AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's collaborate to integrate these cutting-edge AI tools and technologies into your next project.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Start Building <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default AITools