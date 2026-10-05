'use client'

import { useState } from 'react'
import { Play, Square } from 'lucide-react'
import { startSession, stopSession } from './actions'

export default function AdminActions({ activeSessionId }: { activeSessionId?: string }) {
  const [loading, setLoading] = useState(false)

  const handleStart = async (formData: FormData) => {
    setLoading(true)
    await startSession(formData)
    setLoading(false)
  }

  const handleStop = async () => {
    if (!activeSessionId) return
    setLoading(true)
    await stopSession(activeSessionId)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      {activeSessionId ? (
        <button
          onClick={handleStop}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 font-medium"
        >
          <Square size={16} className="fill-current" />
          Stop Session
        </button>
      ) : (
        <form action={handleStart} className="flex flex-col gap-2">
          <input 
            type="text" 
            name="title" 
            placeholder="Session Title (e.g. CS101 - Week 1)" 
            required
            className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50 font-medium"
          >
            <Play size={16} className="fill-current" />
            Start Session
          </button>
        </form>
      )}
    </div>
  )
}
