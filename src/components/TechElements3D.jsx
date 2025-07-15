import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const TechElements3D = () => {
  const [activeElement, setActiveElement] = useState(0)
  
  const techElements = [
    { icon: '🤖', label: 'AI', color: 'from-purple-500 to-violet-600', radius: 80 },
    { icon: '🔗', label: 'Blockchain', color: 'from-orange-500 to-red-600', radius: 100 },
    { icon: '💎', label: 'NFT', color: 'from-green-500 to-emerald-600', radius: 120 },
    { icon: '⚡', label: 'Automation', color: 'from-yellow-500 to-orange-600', radius: 90 },
    { icon: '🎯', label: 'Sales', color: 'from-blue-500 to-indigo-600', radius: 110 },
    { icon: '🚀', label: 'Innovation', color: 'from-pink-500 to-rose-600', radius: 95 }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement((prev) => (prev + 1) % techElements.length)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="absolute inset-0">
      {techElements.map((element, index) => {
        const angle = (index * 360) / techElements.length
        const isActive = index === activeElement
        
        return (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2"
            style={{
              transformOrigin: `${element.radius}px 0px`,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`
            }}
            animate={{
              rotate: [angle, angle + 360]
            }}
            transition={{
              duration: 20 + index * 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <motion.div
              className={`w-12 h-12 rounded-full bg-gradient-to-r ${element.color} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer`}
              animate={{
                scale: isActive ? [1, 1.3, 1] : 1,
                boxShadow: isActive 
                  ? [
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 40px rgba(6, 182, 212, 0.8)',
                      '0 0 20px rgba(6, 182, 212, 0.5)'
                    ]
                  : '0 0 10px rgba(0, 0, 0, 0.3)'
              }}
              transition={{
                duration: 1,
                ease: 'easeInOut'
              }}
              whileHover={{
                scale: 1.2,
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)'
              }}
              onClick={() => setActiveElement(index)}
            >
              <span className="text-lg">{element.icon}</span>
            </motion.div>
            
            {/* Element Label */}
            <motion.div
              className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs font-medium text-cyan-400 whitespace-nowrap"
              animate={{
                opacity: isActive ? 1 : 0.6,
                scale: isActive ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {element.label}
            </motion.div>
            
            {/* Connection Lines */}
            {isActive && (
              <motion.div
                className="absolute top-6 left-6 w-px h-8 bg-gradient-to-b from-cyan-400 to-transparent"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  transformOrigin: 'top'
                }}
              />
            )}
          </motion.div>
        )
      })}
      
      {/* Central Pulse Effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-cyan-400/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Data Streams */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full"
          animate={{
            x: [0, Math.cos((i * 60) * Math.PI / 180) * 150],
            y: [0, Math.sin((i * 60) * Math.PI / 180) * 150],
            opacity: [1, 0],
            scale: [1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeOut'
          }}
        />
      ))}
      
      {/* Interactive Hover Zones */}
      <div className="absolute inset-0 pointer-events-auto">
        {techElements.map((element, index) => {
          const angle = (index * 360) / techElements.length
          const x = Math.cos((angle - 90) * Math.PI / 180) * element.radius
          const y = Math.sin((angle - 90) * Math.PI / 180) * element.radius
          
          return (
            <div
              key={index}
              className="absolute w-16 h-16 rounded-full cursor-pointer"
              style={{
                top: `calc(50% + ${y}px - 32px)`,
                left: `calc(50% + ${x}px - 32px)`
              }}
              onMouseEnter={() => setActiveElement(index)}
              title={element.label}
            />
          )
        })}
      </div>
      
      {/* Tech Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-cyan-400 rounded-full"
          style={{
            top: '50%',
            left: '50%'
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 400],
            y: [0, (Math.random() - 0.5) * 400],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

export default TechElements3D