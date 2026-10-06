'use client'

import { useState } from 'react'
import { verifyOtp, resendOtp } from '@/app/auth/actions'
import { Info } from 'lucide-react'

export default function VerifyOtpForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState('')
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [verifyError, setVerifyError] = useState('')
  
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyStatus('loading')
    setVerifyError('')
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('token', token)
    
    const result = await verifyOtp(formData)
    
    if (result?.error) {
      setVerifyStatus('error')
      setVerifyError(result.error)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setResendStatus('error')
      setResendMessage('Please enter your email address first.')
      return
    }
    
    setResendStatus('loading')
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await resendOtp(formData)
    
    if (result?.error) {
      setResendStatus('error')
      setResendMessage(result.error)
    } else {
      setResendStatus('success')
      setResendMessage('New code sent! Please check your spam folder if you don\'t see it.')
    }
  }

  return (
    <>
      <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
        We sent an 8-digit code to <span className="font-bold text-blue-600 dark:text-blue-400">{email}</span>. Please enter it below.
      </p>
      
      {verifyStatus === 'error' && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/40 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          {verifyError}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <input 
          type="hidden"
          name="email"
          value={email}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">8-Digit Code</label>
          <input 
            required 
            maxLength={8}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="12345678"
            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-center text-2xl tracking-widest text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={verifyStatus === 'loading'}
          className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {verifyStatus === 'loading' ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-slate-600">
          Didn't receive a code?{' '}
          <button 
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'loading' || resendStatus === 'success'}
            className="font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
          >
            {resendStatus === 'loading' ? 'Sending...' : resendStatus === 'success' ? 'Sent!' : 'Request a new code'}
          </button>
        </p>
        {resendStatus === 'error' && <p className="mt-3 font-medium text-red-600">{resendMessage}</p>}
        {resendStatus === 'success' && (
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-blue-900 border border-blue-200 shadow-sm flex items-center justify-center gap-2">
            <Info className="shrink-0 text-blue-600" size={20} />
            <span className="font-medium text-left">{resendMessage}</span>
          </div>
        )}
      </div>
    </>
  )
}
