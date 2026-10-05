'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { processScan } from './actions'

export default function ScannerComponent({ 
  activeSessionId,
  classLevel,
  onScan 
}: { 
  activeSessionId?: string,
  classLevel?: string,
  onScan?: (student: any) => void 
}) {
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

  const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch(e) {
        console.error("Audio not supported", e)
    }
  }

  useEffect(() => {
    if (!activeSessionId) return;

    const scanner = new Html5QrcodeScanner("reader", { 
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false)

    scanner.render(async (decodedText) => {
      if (decodedText === lastScan) return;
      setLastScan(decodedText)
      
      try {
        const qrData = JSON.parse(decodedText)
        
        // Pause scanner if possible
        try { scanner.pause(true) } catch(e) {}
        
        playSuccessSound();
        const result = await processScan(qrData, activeSessionId)
        
        let displayDuration = 1500;

        if (result?.error) {
            console.error("Scan processing error:", result.error)
            setMessage({ type: 'error', text: result.error })
            displayDuration = 4000;
        } else if (result?.student) {
            const student = result.student
            const isDifferentClass = classLevel && String(student.level) !== String(classLevel)

            if (student.isCheater) {
              setMessage({ type: 'error', text: `FLAGGED: ${student.name} (${student.flagReason || 'Suspected violation'})` })
              displayDuration = 4000;
            } else if (isDifferentClass) {
              setMessage({ type: 'warning', text: `Different Class: ${student.name} (Lvl ${student.level}, ${student.major})` })
              displayDuration = 4000;
            } else {
              setMessage({ type: 'success', text: `✅ APPROVED: ${student.name}` })
              displayDuration = 2500;
            }
            
            if (onScan) {
              onScan(student)
            }
        }
        
        setTimeout(() => {
            setMessage(null)
            try { scanner.resume() } catch(e) {}
            setLastScan(null) // allow scanning again
        }, displayDuration)

      } catch (err) {
        console.error("Invalid QR format")
      }
    }, (error) => {})

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [activeSessionId, lastScan])

  if (!activeSessionId) {
    return null
  }

  return (
    <div className="flex flex-col items-center w-full">
      <style dangerouslySetInnerHTML={{__html: `
        #reader {
          border: none !important;
          width: 100% !important;
        }
        
        /* Light mode text colors (inherited by default) */
        
        #reader button {
          background-color: #2563eb !important;
          color: white !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          margin: 10px 0 !important;
          transition: all 0.2s;
        }
        #reader button:hover {
          background-color: #1d4ed8 !important;
        }
        #reader a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
          margin: 10px 0 !important;
          display: inline-block;
          font-weight: 500;
        }
        #reader select {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 1px solid #cbd5e1 !important;
          margin-bottom: 10px !important;
          width: 100%;
          outline: none;
          background: transparent;
        }

        /* Invert black icons in dark mode! */
        .dark #reader img,
        .dark #reader svg {
          filter: invert(1) opacity(0.8);
        }
      `}} />

      <div id="reader" className="w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4"></div>
      
      {message && (
        <div className={`mt-6 p-4 w-full rounded-xl text-center font-bold text-xl transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
            : message.type === 'warning'
              ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
