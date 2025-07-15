import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

const Scene3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360])
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 180])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 30
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      {/* Main Interactive 3D Sphere */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-80 h-80 md:w-96 md:h-96"
          style={{
            transform: `rotateX(${mousePosition.y * 0.3}deg) rotateY(${mousePosition.x * 0.3}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Outer Tech Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-cyan-400/60 shadow-2xl"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(6, 182, 212, 0.4), transparent, rgba(59, 130, 246, 0.4), transparent)',
              boxShadow: '0 0 60px rgba(6, 182, 212, 0.5), inset 0 0 60px rgba(6, 182, 212, 0.3)',
              animation: 'spin 25s linear infinite'
            }}
          />
          
          {/* Middle Data Ring */}
          <div
            className="absolute inset-8 rounded-full border-2 border-blue-400/70"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 70%)',
              boxShadow: 'inset 0 0 40px rgba(59, 130, 246, 0.4)',
              animation: 'spin 18s linear infinite reverse'
            }}
          >
            {/* Orbiting Data Points */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-lg"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(80px)`,
                  animation: `pulse 2s ease-in-out infinite ${i * 0.25}s`,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.8)'
                }}
              />
            ))}
          </div>
          
          {/* Inner Core Sphere */}
          <div
            className="absolute inset-16 rounded-full backdrop-blur-sm border-2 border-cyan-400/90"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.7), rgba(59, 130, 246, 0.5), rgba(6, 182, 212, 0.3))',
              boxShadow: '0 0 50px rgba(6, 182, 212, 0.7), inset 0 0 50px rgba(6, 182, 212, 0.4)',
              animation: 'glow 3s ease-in-out infinite'
            }}
          >
            {/* Neural Network Pattern */}
            <div className="absolute inset-4 rounded-full overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-300/90 to-transparent"
                  style={{
                    left: '50%',
                    transformOrigin: '0 50%',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    animation: `spin ${8 + i}s linear infinite`
                  }}
                />
              ))}
            </div>
            
            {/* Central AI Core */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-300 rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(6, 182, 212, 1)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Orbiting Tech Elements */}
          {[
            { icon: '🤖', label: 'AI', angle: 0, radius: 140, color: 'from-purple-500 to-violet-600' },
            { icon: '🔗', label: 'Blockchain', angle: 60, radius: 160, color: 'from-orange-500 to-red-600' },
            { icon: '💎', label: 'NFT', angle: 120, radius: 150, color: 'from-green-500 to-emerald-600' },
            { icon: '⚡', label: 'Automation', angle: 180, radius: 145, color: 'from-yellow-500 to-orange-600' },
            { icon: '🎯', label: 'Sales', angle: 240, radius: 155, color: 'from-blue-500 to-indigo-600' },
            { icon: '🚀', label: 'Innovation', angle: 300, radius: 165, color: 'from-pink-500 to-rose-600' }
          ].map((element, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2"
              style={{
                transformOrigin: `${element.radius}px 0px`,
                transform: `translate(-50%, -50%) rotate(${element.angle}deg)`,
                animation: `spin ${20 + index * 2}s linear infinite`
              }}
            >
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${element.color} flex items-center justify-center text-white font-bold shadow-xl cursor-pointer border-2 border-white/30 hover:scale-125 transition-transform duration-300`}
                style={{
                  boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)',
                  animation: 'glow 3s ease-in-out infinite'
                }}
              >
                <span className="text-2xl">{element.icon}</span>
              </div>
              
              <div
                className="absolute top-18 left-1/2 transform -translate-x-1/2 text-xs font-bold text-cyan-300 whitespace-nowrap bg-gray-900/90 px-3 py-1 rounded-full backdrop-blur-sm border border-cyan-400/50"
              >
                {element.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Data Particles */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 3}s`
          }}
        />
      ))}
      
      {/* Binary Code Rain */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-cyan-400/40 font-mono text-xs select-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-100px',
            animation: `fall ${8 + Math.random() * 4}s linear infinite ${Math.random() * 5}s`
          }}
        >
          {Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join('')}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 60px rgba(6, 182, 212, 0.8); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(0); opacity: 0; }
          50% { transform: translateY(-200px) scale(1); opacity: 1; }
        }
        
        @keyframes fall {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default Scene3D