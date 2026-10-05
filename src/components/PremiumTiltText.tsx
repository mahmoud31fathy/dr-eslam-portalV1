'use client'

import React, { useRef, useEffect } from 'react'

export default function PremiumTiltText({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId: number
    // Current rotation state
    const current = { x: 0, y: 0 }
    // Target rotation based on mouse
    const target = { x: 0, y: 0 }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      
      // Calculate distance from center of the screen/container
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // Values range roughly from -1 to 1 based on screen position
      const normalizedX = (e.clientX - centerX) / centerX
      const normalizedY = (e.clientY - centerY) / centerY

      // Invert Y so moving mouse up tilts text up
      target.x = -normalizedY * 20 // Max 20 degrees tilt
      target.y = normalizedX * 20
    }

    const handleMouseLeave = () => {
      target.x = 0
      target.y = 0
    }

    const animate = () => {
      // Lerp (smooth interpolation) for buttery $10k website feel
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08

      if (container) {
        container.style.transform = `perspective(1200px) rotateX(${current.x}deg) rotateY(${current.y}deg) translateZ(50px)`
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)
    
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div 
      style={{ transformStyle: 'preserve-3d' }}
      className="relative"
    >
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </div>
  )
}
