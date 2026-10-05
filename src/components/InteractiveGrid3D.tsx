'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FlowingGrid({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // A wide plane with many segments for smooth curving
  const planeArgs: [number, number, number, number] = [80, 40, 160, 80]
  
  // Store the original Z coordinates
  const originalZ = useRef<Float32Array | null>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const geometry = meshRef.current.geometry as THREE.PlaneGeometry
    const position = geometry.attributes.position

    if (!originalZ.current) {
      originalZ.current = new Float32Array(position.count)
      for (let i = 0; i < position.count; i++) {
        originalZ.current[i] = position.getZ(i)
      }
    }

    const time = state.clock.getElapsedTime() * 0.5 // Speed of the waves

    // Apply continuous wave distortion
    for (let i = 0; i < position.count; i++) {
      const vx = position.getX(i)
      const vy = position.getY(i)
      
      // Combine multiple sine waves for a complex, natural-looking flow
      const wave1 = Math.sin(vx * 0.2 + time) * Math.cos(vy * 0.2 + time) * 1.5
      const wave2 = Math.sin(vx * 0.1 - time * 0.8) * Math.cos(vy * 0.15 + time * 0.5) * 2.0
      
      position.setZ(i, (originalZ.current[i] || 0) + wave1 + wave2)
    }
    
    position.needsUpdate = true
  })

  const gridColor = isDark ? '#3b82f6' : '#2563eb'
  const opacity = isDark ? 0.35 : 0.25

  return (
    <mesh ref={meshRef} rotation={[-Math.PI * 0.35, 0, 0]} position={[0, -4, -15]}>
      <planeGeometry args={planeArgs} />
      <meshBasicMaterial 
        color={gridColor} 
        wireframe={true} 
        transparent 
        opacity={opacity}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </mesh>
  )
}

export default function InteractiveGrid3D() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    
    // Optional: observe class changes on HTML
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-transparent to-slate-100 dark:to-slate-900/50">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
        <fog attach="fog" args={[isDark ? '#020617' : '#f8fafc', 10, 35]} />
        <FlowingGrid isDark={isDark} />
      </Canvas>
    </div>
  )
}
