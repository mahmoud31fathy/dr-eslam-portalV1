'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeDisplay({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [mounted, setMounted] = useState(false)
  const [timestamp, setTimestamp] = useState(0)
  const [progress, setProgress] = useState(100)
  const [ipAddress, setIpAddress] = useState<string>('fetching...')

  useEffect(() => {
    setMounted(true)
    setTimestamp(Date.now())

    // Fetch the public IP address of the user
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('unknown'))
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Update timestamp every 20 seconds
    const interval = setInterval(() => {
      setTimestamp(Date.now())
      setProgress(100)
    }, 20000)

    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Update progress bar every second
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / 20)))
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [timestamp, mounted]) // Reset progress when timestamp changes

  const qrValue = JSON.stringify({ studentId, studentName, ip: ipAddress, timestamp })

  // Prevent hydration mismatch by rendering a placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center w-[290px] h-[290px]">
           <div className="animate-pulse bg-slate-100 w-[256px] h-[256px] rounded"></div>
        </div>
        <div className="w-full max-w-[256px] bg-slate-200 h-2 mt-6 rounded-full overflow-hidden"></div>
        <p className="text-sm text-slate-500 mt-3 font-medium opacity-0">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`transition-opacity duration-500 ${progress <= 5 ? 'opacity-30' : 'opacity-100'} bg-white p-4 rounded-2xl shadow-sm border border-slate-200`}>
        <QRCodeSVG value={qrValue} size={256} />
      </div>
      <div className="w-full max-w-[256px] bg-slate-200 h-2 mt-6 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-1000 ease-linear" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-slate-500 mt-3 font-medium">Code refreshes automatically</p>
    </div>
  )
}
