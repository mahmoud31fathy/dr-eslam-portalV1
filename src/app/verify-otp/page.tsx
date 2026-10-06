import VerifyOtpForm from './VerifyOtpForm'

export default async function VerifyOtpPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  const email = params?.email || ''

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden z-0">
      {/* Ambient background glow for dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 relative z-10">
        <h1 className="mb-2 text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight">Verify Your Email</h1>
        
        <VerifyOtpForm initialEmail={email} />
      </div>
    </div>
  )
}
