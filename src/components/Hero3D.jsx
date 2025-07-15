import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Hero3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/30" />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}

      {/* Main Interactive Sphere */}
      <motion.div
        className="relative w-64 h-64 md:w-80 md:h-80"
        animate={{
          rotateX: mousePosition.y,
          rotateY: mousePosition.x
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-4 rounded-full border border-blue-400/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Sphere */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/30 backdrop-blur-sm border border-cyan-400/50 shadow-2xl shadow-cyan-500/20"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 20px rgba(6, 182, 212, 0.3)',
              '0 0 40px rgba(6, 182, 212, 0.5)',
              '0 0 20px rgba(6, 182, 212, 0.3)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-400/10 to-blue-500/20" />
          
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        </motion.div>
        
        {/* Orbiting Elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-cyan-400 rounded-full"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${60 + i * 20}px 0px`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </motion.div>
      
      {/* Tech Grid Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border border-cyan-400/20" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero3D