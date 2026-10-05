import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ClassScannerView from './ClassScannerView'

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: classData } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (!classData) {
    return <div className="p-8 text-center text-red-500 font-bold">Class not found</div>
  }

  // Get active session for this class, if any
  const { data: activeSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('class_id', id)
    .eq('is_active', true)
    .single()

  // Get past sessions
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('*, attendance_records(count)')
    .eq('class_id', id)
    .eq('is_active', false)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition font-medium">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        
        <header className="mb-8 rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{classData.name}</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">Level {classData.level} {classData.major && `• ${classData.major}`}</p>
          </div>
        </header>

        <ClassScannerView 
          classData={classData} 
          activeSession={activeSession} 
        />

        {/* Past Sessions */}
        <div className="mt-8 rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Past Sessions History</h2>
          {pastSessions && pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map((session: any) => (
                <Link 
                  href={`/sessions/${session.id}`}
                  key={session.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition block group cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{session.title}</p>
                    <p className="text-sm text-slate-500">{new Date(session.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium">Attendance</p>
                      <p className="font-bold text-slate-900 dark:text-white">{session.attendance_records?.[0]?.count || 0} Students</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No past sessions yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
