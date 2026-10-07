'use client'

import { useState } from 'react'
import { startSession, stopSession } from '@/app/admin/actions'
import ScannerComponent from '@/app/scanner/ScannerComponent'
import UltrasonicBroadcaster from '@/components/UltrasonicBroadcaster'

export default function ClassScannerView({ 
  classData, 
  activeSession 
}: { 
  classData: any,
  activeSession: any 
}) {
  const [scannedLog, setScannedLog] = useState<any[]>([])

  const handleScan = (student: any) => {
    setScannedLog(prev => {
      if (prev.some(s => s.id === student.id)) return prev
      return [student, ...prev]
    })
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Class Scanner
          </h2>
        </div>
        
        {!activeSession ? (
          <form action={async (fd) => {
            fd.append('class_id', classData.id)
            await startSession(fd)
          }} className="mb-6">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg shadow-blue-500/30">
              Start Session
            </button>
          </form>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <span className="self-start sm:self-auto bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Session Active
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <UltrasonicBroadcaster sessionId={activeSession.id} />
                <button 
                  onClick={() => stopSession(activeSession.id, classData.id)}
                  className="whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 font-semibold text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Stop Session
                </button>
              </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <ScannerComponent 
                activeSessionId={activeSession.id} 
                classLevel={classData.level}
                classMajor={classData.major}
                onScan={handleScan} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Live Scan Log</h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {scannedLog.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No students scanned yet in this session.</p>
          ) : (
            scannedLog.map((student, idx) => {
              const isDifferentLevel = String(student.level) !== String(classData.level)
              const isDifferentMajor = classData.major ? String(student.major || '').trim().toLowerCase() !== String(classData.major).trim().toLowerCase() : false
              const isDifferentClass = isDifferentLevel || isDifferentMajor
              
              return (
                <div key={`${student.id}-${idx}`} className={`p-4 rounded-xl border ${
                  student.isCheater 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' 
                    : isDifferentClass
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">ID: {student.id}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">{student.major || 'No Major'}</span>
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">Lvl {student.level}</span>
                      </div>
                    </div>
                    {student.isCheater ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                          FLAGGED
                        </span>
                        {student.flagReason && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium max-w-[200px] text-right leading-tight mt-1">
                            {student.flagReason}
                          </span>
                        )}
                      </div>
                    ) : isDifferentClass ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                          Different Class
                        </span>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium max-w-[200px] text-right leading-tight mt-1">
                          Student is L{student.level} {student.major || ''}, Class is L{classData.level} {classData.major || ''}
                        </span>
                      </div>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        APPROVED
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
