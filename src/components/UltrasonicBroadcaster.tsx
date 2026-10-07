'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function UltrasonicBroadcaster({ sessionId }: { sessionId?: string }) {
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)

  const toggleBroadcast = () => {
    if (isBroadcasting) {
      oscRef.current?.stop()
      oscRef.current?.disconnect()
      audioCtxRef.current?.close()
      setIsBroadcasting(false)
    } else {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContext()
        // Resume context for iOS Safari
        if (ctx.state === 'suspended') {
          ctx.resume()
        }
        
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        // 19.5kHz is truly ultrasonic (inaudible to almost all humans) but still detectable by phones
        osc.type = 'sine'
        osc.frequency.setValueAtTime(19500, ctx.currentTime)
        
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime) // Max volume

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        osc.start()

        audioCtxRef.current = ctx
        oscRef.current = osc
        setIsBroadcasting(true)
      } catch (e) {
        console.error("Audio broadcast failed", e)
        alert("Audio broadcast failed. Ensure you have interacted with the page.")
      }
    }
  }

  useEffect(() => {
    return () => {
      oscRef.current?.stop()
      audioCtxRef.current?.close()
    }
  }, [])

  // OBLIVIATE_ULTRASONIC

  return (
    <button
      onClick={toggleBroadcast}
      className={`whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
        isBroadcasting 
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 dark:hover:bg-indigo-500/20'
      }`}
    >
      {isBroadcasting ? <VolumeX size={18} /> : <Volume2 size={18} />}
      {isBroadcasting ? 'Stop Ultrasonic' : 'Broadcast Ultrasonic'}
    </button>
  )
}
