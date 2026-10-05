'use client'

import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // Only add mouse listener on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
      window.addEventListener('mousemove', handleMouseMove)
      setIsHovering(true)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden pointer-events-none">
      {/* Interactive Mouse Follower (Only visible on hover-capable devices) */}
      {isHovering && (
        <div 
          className="absolute rounded-full bg-blue-500/30 dark:bg-blue-400/20 blur-[100px] transition-transform duration-500 ease-out will-change-transform"
          style={{
            width: '600px',
            height: '600px',
            transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          }}
        />
      )}

      {/* Static Orbs (Visible everywhere, but serves as fallback for mobile) */}
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] top-auto h-[600px] w-[600px] rounded-full bg-emerald-500/20 dark:bg-emerald-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
    </div>
  )
}
