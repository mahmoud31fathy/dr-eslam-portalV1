import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import QRCodeDisplay from './QRCodeDisplay'
import { signout } from '@/app/auth/actions'
import { LogOut, ShieldAlert } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import AdminView from './AdminView'
import UltrasonicReceiver from '@/components/UltrasonicReceiver'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // If the database trigger didn't create the profile, fallback to the data we saved during signup
    const metadata = user.user_metadata || {}
    
    profile = {
      id: user.id,
      full_name: metadata.full_name || 'Student',
      student_id: metadata.student_id || '00000000000000',
      national_id: metadata.national_id || '00000000000000',
      phone_number: metadata.phone_number || '',
      email: user.email || '',
      role: metadata.role || 'student', // Provide a default role
      major: metadata.major || 'AI',
      level: metadata.level || 1,
    }

    // Try to self-heal by inserting the missing profile
    const { error } = await supabase.from('profiles').insert([profile])
    if (error) {
      console.error("Self-healing profile insert failed:", error)
      // The user's browser is likely using a deleted account's session.
      // Redirect them to login so they are forced to log in with the new account.
      // We can't easily sign out from a server component without cookie manipulation,
      // so we just redirect them. Or we can let them click the Log Out button.
    }
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'superadmin'

  let history: any[] = []
  let allStudents: any[] = []
  let allSessions: any[] = []
  let allAttendance: any[] = []

  let allClasses: any[] = []

  if (isAdmin) {
    const [{ data: studentsData }, { data: sessionsData }, { data: attendanceData }, { data: classesData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('sessions').select('*').order('created_at', { ascending: true }),
      supabase.from('attendance_records').select('*'),
      supabase.from('classes').select('*').order('created_at', { ascending: false })
    ])
    allStudents = studentsData || []
    allSessions = sessionsData || []
    allAttendance = attendanceData || []
    allClasses = classesData || []
  } else {
    const { data } = await supabase
      .from('attendance_records')
      .select('*, sessions(title, date)')
      .eq('student_id', user.id)
      .order('scanned_at', { ascending: false })
    history = data || []
  }

  // Format header name to remove "(Super Admin)" etc.
  const formattedName = profile.full_name ? profile.full_name.replace(/\s*\(.*?\)\s*/g, '') : 'User'
  const formattedRole = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Student'

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {formattedName}</h1>
            <p className="text-slate-500 font-medium">
              {isAdmin ? `Role: ${formattedRole}` : `Student ID: ${profile.student_id}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <form action={signout}>
              <button type="submit" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition font-medium">
                <LogOut size={20} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </form>
          </div>
        </header>

        {isAdmin ? (
          <AdminView 
            profile={profile} 
            students={allStudents} 
            sessions={allSessions} 
            attendance={allAttendance} 
            classes={allClasses}
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* QR Code Card */}
            <div className="flex flex-col items-center rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Your Attendance Pass</h2>
              <QRCodeDisplay studentId={profile.student_id} studentName={profile.full_name} />
              <div className="mt-8 w-full">
                <UltrasonicReceiver />
              </div>
            </div>

            {/* History Card */}
            <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Recent Attendance</h2>
              {history && history.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((record: any) => (
                    <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">{record.sessions?.title || 'Unknown Session'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(record.scanned_at).toLocaleString()}</p>
                      </div>
                      <span className="self-start sm:self-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Present
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No attendance records yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
