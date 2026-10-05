'use client'

import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const res = await signup(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12 relative overflow-hidden z-0">
      {/* Ambient background glow for dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-3xl rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 relative z-10">
        <h1 className="mb-6 text-3xl font-bold text-center text-slate-900 dark:text-white tracking-tight">Create an Account</h1>
        
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/40 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input 
              name="fullName" 
              required 
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">National ID</label>
            <input 
              name="nationalId" 
              type="text"
              required 
              maxLength={14}
              pattern="\d{14}"
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity('Please fill out this field.');
                } else if (target.validity.patternMismatch) {
                  target.setCustomValidity('National ID must be exactly 14 digits.');
                }
              }}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\D/g, ''); // Removes any non-digit character instantly
                target.setCustomValidity('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Student ID (University Code)</label>
            <input 
              name="studentId" 
              type="text"
              required 
              maxLength={14}
              pattern="\d{14}"
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity('Please fill out this field.');
                } else if (target.validity.patternMismatch) {
                  target.setCustomValidity('Student ID must be exactly 14 digits.');
                }
              }}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/\D/g, ''); // Removes any non-digit character instantly
                target.setCustomValidity('');
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
            <input 
              name="phoneNumber" 
              type="tel"
              required 
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Major</label>
            <select
              name="major"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&>option]:bg-white dark:[&>option]:bg-slate-900"
            >
              <option value="" disabled selected>Select Major</option>
              <option value="AI">AI</option>
              <option value="MED">MED</option>
              <option value="AVI">AVI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Level</label>
            <select
              name="level"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&>option]:bg-white dark:[&>option]:bg-slate-900"
            >
              <option value="" disabled selected>Select Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative mt-1">
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                pattern=".{8,}"
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.valueMissing) {
                    target.setCustomValidity('Please fill out this field.');
                  } else if (target.validity.patternMismatch) {
                    target.setCustomValidity('Password must be at least 8 characters long.');
                  }
                }}
                onInput={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative mt-1">
              <input 
                name="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                required 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 pr-10 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="md:col-span-2 w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 mt-2"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
