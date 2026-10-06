import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import ExportCSVButton from './ExportCSVButton'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Fetch session and class details
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('*, classes(name, level)')
    .eq('id', id)
    .single()

  if (!sessionData) {
    return <div className="p-8 text-center text-red-500 font-bold">Session not found</div>
  }

  // Fetch attendance records with student profiles
  const { data: attendanceData } = await supabase
    .from('attendance_records')
    .select('id, scanned_at, profiles!inner(*)')
    .eq('session_id', id)
    .order('scanned_at', { ascending: false })

  const records = attendanceData || []

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/classes/${sessionData.class_id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition font-medium">
          <ArrowLeft size={20} />
          Back to Class
        </Link>
        
        <header className="mb-8 rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{sessionData.title}</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">{sessionData.classes?.name} (Level {sessionData.classes?.level}) • {new Date(sessionData.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
              <Users size={18} />
              {records.length} Attendees
            </div>
            {records.length > 0 && (
              <ExportCSVButton records={records} sessionTitle={`${sessionData.classes?.name}_${sessionData.title}`} />
            )}
          </div>
        </header>

        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Attendance List</h2>
          
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  <th className="pb-4 font-medium px-4">Student</th>
                  <th className="pb-4 font-medium px-4">ID / Major</th>
                  <th className="pb-4 font-medium px-4">Email</th>
                  <th className="pb-4 font-medium px-4">Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No students attended this session.</td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const profile = record.profiles as any
                    return (
                      <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{profile.full_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.student_id}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">{profile.major}</span>
                            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">Lvl {profile.level}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">{profile.email}</td>
                        <td className="py-4 px-4 text-sm text-slate-500">{new Date(record.scanned_at).toLocaleString()}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
