import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const ScrollAnimation3D = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  
  // Transform values based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -600])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 720])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 0.5])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 0.8, 0.2])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Floating Tech Icons */}
      <motion.div
        className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"
        style={{ y: y1, rotate, opacity }}
      >
        <div className="text-white font-bold text-xl">&lt;/&gt;</div>
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center"
        style={{ y: y2, rotate: useTransform(rotate, (r) => -r), opacity }}
      >
        <div className="text-white font-bold text-sm">AI</div>
      </motion.div>
      
      <motion.div
        className="absolute top-60 left-1/4 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
        style={{ y: y3, rotate: useTransform(rotate, (r) => r * 0.5), opacity }}
      >
        <div className="text-white font-bold text-xs">NFT</div>
      </motion.div>
      
      {/* Floating Binary Code */}
      <motion.div
        className="absolute top-32 right-10 text-cyan-400 font-mono text-xs opacity-60"
        style={{ y: y1, opacity }}
      >
        01001001<br/>
        01001110<br/>
        01001110
      </motion.div>
      
      <motion.div
        className="absolute top-80 left-20 text-blue-400 font-mono text-xs opacity-60"
        style={{ y: y2, opacity }}
      >
        11000001<br/>
        10101010<br/>
        11110000
      </motion.div>
      
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-1/2 right-8 w-1 h-32 bg-gray-700 rounded-full z-10"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1]) }}
      >
        <motion.div
          className="w-full bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"
          style={{ height: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
        />
      </motion.div>
      
      {/* Parallax Tech Elements */}
      <motion.div
        className="absolute bottom-20 left-1/3 w-16 h-16 border-2 border-cyan-400/30 rounded-lg"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [0, 300]),
          rotate: useTransform(scrollYProgress, [0, 1], [0, 180]),
          opacity
        }}
        animate={{
          borderColor: [
            'rgba(6, 182, 212, 0.3)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(6, 182, 212, 0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-2 border border-cyan-400/50 rounded" />
      </motion.div>
      
      {/* Data Stream Effect */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          style={{
            left: `${20 + i * 15}%`,
            top: '10%',
            y: useTransform(scrollYProgress, [0, 1], [0, window.innerHeight || 800])
          }}
          animate={{
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5
          }}
        />
      ))}
      
      {/* Geometric Shapes */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-20 h-20"
        style={{
          rotate: useTransform(scrollYProgress, [0, 1], [0, 360]),
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 1]),
          opacity
        }}
      >
        <div className="w-full h-full border-2 border-blue-400/40 transform rotate-45">
          <div className="absolute inset-2 border border-cyan-400/60 transform -rotate-45" />
        </div>
      </motion.div>
      
      {/* Network Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M100,100 Q200,50 300,100 T500,100"
          stroke="rgba(6, 182, 212, 0.4)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -20]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            opacity
          }}
        />
        <motion.path
          d="M150,200 Q250,150 350,200 T550,200"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3,3"
          animate={{
            strokeDashoffset: [0, -15]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            opacity
          }}
        />
      </svg>
    </div>
  )
}

export default ScrollAnimation3D