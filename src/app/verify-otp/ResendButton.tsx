'use client'

import { useState } from 'react'
import { resendOtp } from '@/app/auth/actions'

export default function ResendButton({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async () => {
    if (!email) return;
    setStatus('loading')
    const formData = new FormData()
    formData.append('email', email)
    
    const result = await resendOtp(formData)
    
    if (result?.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('success')
      setMessage('New code sent! Please check your spam folder if you don\'t see it.')
    }
  }

  return (
    <div className="mt-6 text-center text-sm">
      <p className="text-slate-600">
        Didn't receive a code?{' '}
        <button 
          type="button"
          onClick={handleResend}
          disabled={status === 'loading' || status === 'success'}
          className="font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
        >
          {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Resend Code'}
        </button>
      </p>
      {status === 'error' && <p className="mt-3 font-medium text-red-600">{message}</p>}
      {status === 'success' && (
        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-blue-900 border border-blue-200 shadow-sm flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info shrink-0 text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span className="font-medium text-left">{message}</span>
        </div>
      )}
    </div>
  )
}
