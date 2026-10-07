'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { recordUltrasonicAttendance } from '@/app/actions/ultrasonicActions'

export default function UltrasonicReceiver() {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState<'idle' | 'listening' | 'detected' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const stopListening = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioCtxRef.current) audioCtxRef.current.close()
    
    setIsListening(false)
    setStatus('idle')
  }

  const startListening = async () => {
    try {
      setMessage('')
      setStatus('listening')
      setIsListening(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: { ideal: 44100 }
        } 
      })
      streamRef.current = stream
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContext({ sampleRate: 44100 })
      // Resume context for iOS Safari
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      audioCtxRef.current = ctx
      
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const sampleRate = ctx.sampleRate
      
      // We are looking for 16kHz frequency (more reliable on phones)
      const targetFreq = 16000
      const binIndex = Math.round((targetFreq * analyser.fftSize) / sampleRate)

      let consecutiveDetections = 0

      const checkAudio = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Check the amplitude at the target frequency bin
        // Also check nearby bins to account for slight frequency shifts (+- 8 bins)
        let maxAmplitude = 0
        for (let i = Math.max(0, binIndex - 8); i <= Math.min(bufferLength - 1, binIndex + 8); i++) {
          if (dataArray[i] > maxAmplitude) {
            maxAmplitude = dataArray[i]
          }
        }
        
        if (maxAmplitude > 70) { // Lower threshold for detection (was 150)
          consecutiveDetections++
        } else {
          consecutiveDetections = 0
        }
        
        if (consecutiveDetections > 3) { // Require fewer consecutive detections (was 5)
          // Detected!
          setStatus('detected')
          setMessage('Ultrasonic signal detected! Logging attendance...')
          handleDetection()
          return // Stop the loop
        }
        
        animationFrameRef.current = requestAnimationFrame(checkAudio)
      }
      
      checkAudio()
      
    } catch (e) {
      console.error("Mic access denied or error", e)
      setStatus('error')
      setMessage('Microphone access denied or error occurred.')
      setIsListening(false)
    }
  }

  const handleDetection = async () => {
    // Stop the mic after detection
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      
    try {
      const res = await recordUltrasonicAttendance()
      if (res.error) {
        setStatus('error')
        setMessage(res.error)
      } else {
        setStatus('success')
        setMessage('Attendance recorded successfully!')
      }
    } catch (e) {
      setStatus('error')
      setMessage('Failed to log attendance.')
    }
    
    setIsListening(false)
  }

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  // OBLIVIATE_ULTRASONIC

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Attend (Ultrasonic)</h3>
      <p className="text-sm text-center text-slate-500 max-w-xs">
        Allow microphone access to automatically log attendance when the doctor broadcasts the signal.
      </p>
      
      {status === 'idle' || status === 'error' ? (
        <button
          onClick={startListening}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
        >
          <Mic size={20} />
          Listen for Signal
        </button>
      ) : status === 'listening' ? (
        <button
          onClick={stopListening}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-semibold transition animate-pulse"
        >
          <Loader2 size={20} className="animate-spin" />
          Listening... (Click to Cancel)
        </button>
      ) : null}

      {message && (
        <div className={`mt-2 p-3 rounded-lg text-center text-sm font-medium w-full ${
          status === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
          status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
