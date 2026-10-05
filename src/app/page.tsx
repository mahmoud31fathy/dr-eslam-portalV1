import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InteractiveGrid3D from '@/components/InteractiveGrid3D'
import PremiumTiltText from '@/components/PremiumTiltText'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden px-4">
      {/* Real 3D Interactive Canvas Background */}
      <InteractiveGrid3D />

      <div className="relative z-10 text-center pointer-events-none">
        <h1 className="mb-4 text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight pointer-events-auto text-3d">
          Dr. Eslam Attendance Portal
        </h1>
        <p className="mb-8 text-xl font-medium text-slate-600 dark:text-slate-400 pointer-events-auto">
          Secure QR-based attendance tracking.
        </p>
        <div className="flex justify-center gap-4 pointer-events-auto">
          <Link 
            href="/login" 
            className="rounded-2xl bg-white dark:bg-slate-900 px-8 py-4 font-bold text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
          >
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
