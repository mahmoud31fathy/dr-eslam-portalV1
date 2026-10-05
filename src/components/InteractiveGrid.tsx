'use client'

import React, { useEffect, useRef } from 'react'

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let w = 0
    let h = 0
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 }
    let trail: { x: number; y: number; life: number }[] = []
    
    // Config
    const spacing = 40
    const radius = 350 // Increased size of the sphere distortion
    const strength = 1.2 // Increased distortion strength

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      mouse.targetX = e.touches[0].clientX
      mouse.targetY = e.touches[0].clientY
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.1
      mouse.y += (mouse.targetY - mouse.y) * 0.1

      const isDarkMode = document.documentElement.classList.contains('dark')
      
      // Update mouse trail
      if (mouse.x !== -1000) {
        trail.push({ x: mouse.x, y: mouse.y, life: 1.0 })
      }
      
      for (let i = 0; i < trail.length; i++) {
        trail[i].life -= 0.02 // Control tail length (smaller = longer tail)
      }
      // Remove dead particles
      while (trail.length > 0 && trail[0].life <= 0) {
        trail.shift()
      }

      // Make base grid slightly more visible
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
      ctx.lineWidth = 1

      // Draw vertical lines
      for (let x = 0; x <= w; x += spacing) {
        ctx.beginPath()
        for (let y = 0; y <= h; y += 10) {
          let drawX = x
          let drawY = y

          let maxFactor = 0
          let bestDx = 0
          let bestDy = 0

          // Calculate distortion based on the trail to leave a fading warp effect
          for (let i = 0; i < trail.length; i++) {
            const p = trail[i]
            let dx = x - p.x
            let dy = y - p.y
            let dist = Math.sqrt(dx * dx + dy * dy)
            
            if (dist < radius) {
              let factor = (1 - Math.pow(dist / radius, 2)) * p.life
              if (factor > maxFactor) {
                maxFactor = factor
                bestDx = dx
                bestDy = dy
              }
            }
          }

          drawX += bestDx * maxFactor * strength
          drawY += bestDy * maxFactor * strength

          if (y === 0) {
            ctx.moveTo(drawX, drawY)
          } else {
            ctx.lineTo(drawX, drawY)
          }
        }
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = 0; y <= h; y += spacing) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 10) {
          let drawX = x
          let drawY = y

          let maxFactor = 0
          let bestDx = 0
          let bestDy = 0

          for (let i = 0; i < trail.length; i++) {
            const p = trail[i]
            let dx = x - p.x
            let dy = y - p.y
            let dist = Math.sqrt(dx * dx + dy * dy)
            
            if (dist < radius) {
              let factor = (1 - Math.pow(dist / radius, 2)) * p.life
              if (factor > maxFactor) {
                maxFactor = factor
                bestDx = dx
                bestDy = dy
              }
            }
          }

          drawX += bestDx * maxFactor * strength
          drawY += bestDy * maxFactor * strength

          if (x === 0) {
            ctx.moveTo(drawX, drawY)
          } else {
            ctx.lineTo(drawX, drawY)
          }
        }
        ctx.stroke()
      }

      // Draw a fading glow along the trail
      ctx.globalCompositeOperation = 'screen'
      for (let i = 0; i < trail.length; i += 2) { // Skip some to improve performance
        const p = trail[i]
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius)
        const alpha = p.life * (isDarkMode ? 0.08 : 0.05)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2)
      }
      ctx.globalCompositeOperation = 'source-over'

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  )
}
