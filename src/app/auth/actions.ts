'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." }
  }

  const data = {
    email,
    password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string
  const studentId = formData.get('studentId') as string
  const nationalId = formData.get('nationalId') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const major = formData.get('major') as string
  const level = formData.get('level') as string

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address containing an '@' and a domain." }
  }

  if (!/^\d{14}$/.test(nationalId)) {
    return { error: "National ID must be exactly 14 digits." }
  }

  if (!/^\d{14}$/.test(studentId)) {
    return { error: "Student ID must be exactly 14 digits." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        student_id: studentId,
        national_id: nationalId,
        phone_number: phoneNumber,
        major,
        level: parseInt(level, 10),
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Redirect to OTP verification page
  redirect(`/verify-otp?email=${encodeURIComponent(email)}`)
}

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function resendOtp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message }
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
