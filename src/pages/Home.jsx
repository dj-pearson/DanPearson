
import { motion } from 'framer-motion'
import { ArrowRight, Code, Zap, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Scene3D from '../components/Scene3D'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="relative">
      {/* 3D Scene Background - Fixed positioning */}
      <Scene3D />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl"
          >
            Dan Pearson
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200 font-medium drop-shadow-lg"
          >
            Sales Leader • NFT Developer • AI Enthusiast
          </motion.p>
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => navigate('/about')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2 mx-auto backdrop-blur-sm border border-cyan-400/30 relative z-30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore My Work <ArrowRight size={20} />
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
              />
            </motion.div>
            <p className="text-cyan-400 text-sm mt-2 font-medium">Scroll to explore</p>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="relative py-20 px-4 max-w-6xl mx-auto z-10 bg-gray-900/80 backdrop-blur-sm">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-bold text-center mb-16 text-cyan-400"
        >
          How I Can Help
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Code,
              title: "NFT Development",
              desc: "Unique generative collections with cutting-edge technology and mathematical precision",
              gradient: "from-purple-500 to-violet-600"
            },
            {
              icon: Zap,
              title: "AI Integration",
              desc: "Leveraging OpenAI, Auto-GPT, and machine learning for innovative business solutions",
              gradient: "from-cyan-500 to-blue-600"
            },
            {
              icon: Globe,
              title: "Sales Leadership",
              desc: "15+ years driving growth, building relationships, and delivering results",
              gradient: "from-green-500 to-emerald-600"
            }
          ].map((service, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-500 group relative z-20"
            >
              <div className={`bg-gradient-to-r ${service.gradient} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-300 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-4 max-w-4xl mx-auto text-center z-10 bg-gray-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-3xl p-12 border border-cyan-500/30 backdrop-blur-sm relative z-20"
        >
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            Ready to Innovate Together?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Let's combine cutting-edge technology with proven business strategies to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/projects')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 relative z-30"
            >
              View My Projects
            </motion.button>
            <motion.button
              onClick={() => navigate('/connect')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-cyan-500 text-cyan-400 px-8 py-4 rounded-full font-semibold hover:bg-cyan-500/10 transition-all duration-300 relative z-30"
            >
              Get In Touch
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Home
