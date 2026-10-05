'use client'

import { login } from '@/app/auth/actions'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden z-0">
      {/* Ambient background glow for dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 relative z-10">
        <h1 className="mb-6 text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
        
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/40 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity('Please fill out this field.');
                } else {
                  target.setCustomValidity('Please enter a valid email address');
                }
              }}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.setCustomValidity('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative mt-1">
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 pr-10 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Log In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account? <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
