import { verifyOtp } from '@/app/auth/actions'
import ResendButton from './ResendButton'

export default async function VerifyOtpPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const params = await searchParams
  const email = params?.email || ''

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden z-0">
      {/* Ambient background glow for dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 relative z-10">
        <h1 className="mb-2 text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight">Verify Your Email</h1>
        <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
          We sent an 8-digit code to <span className="font-bold text-blue-600 dark:text-blue-400">{email}</span>. Please enter it below.
        </p>
        <form action={async (fd) => {
          "use server";
          await verifyOtp(fd);
        }} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">8-Digit Code</label>
            <input 
              name="token" 
              required 
              maxLength={8}
              placeholder="12345678"
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-center text-2xl tracking-widest text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Verify & Continue
          </button>
        </form>
        
        {email && <ResendButton email={email} />}
      </div>
    </div>
  )
}
