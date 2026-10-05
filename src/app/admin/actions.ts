'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// We use the service role key to bypass RLS for admin tasks like resetting passwords
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function addClass(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const level = formData.get('level') as string
  const major = formData.get('major') as string
  
  if (!name || !level) return { error: 'Name and Level are required' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('classes')
    .insert([{ name, level, major, admin_id: user.id }])

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
}

export async function deleteClass(formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('class_id') as string
  
  if (!classId) return { error: 'Class ID is required' }

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 2. Fetch class to ensure it exists and check ownership
  const { data: cls } = await supabaseAdmin
    .from('classes')
    .select('admin_id')
    .eq('id', classId)
    .single()

  if (!cls) return { error: 'Class not found' }

  // 3. Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 4. Verify ownership or superadmin status
  if (cls.admin_id !== user.id && profile?.role !== 'superadmin') {
    return { error: 'You do not have permission to delete this class' }
  }

  // 5. Delete associated sessions first to satisfy foreign key constraints
  await supabaseAdmin.from('sessions').delete().eq('class_id', classId)

  // 6. Delete the class
  const { error } = await supabaseAdmin
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
}
export async function startSession(formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('class_id') as string
  
  if (!classId) return { error: 'Class ID is required' }

  // First, deactivate any currently active session for this class
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('class_id', classId)
    .eq('is_active', true)

  // Create new session
  await supabase
    .from('sessions')
    .insert([{ class_id: classId, title: 'Session ' + new Date().toLocaleDateString(), is_active: true }])

  revalidatePath(`/classes/${classId}`)
}

export async function stopSession(sessionId: string, classId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId)

  revalidatePath(`/classes/${classId}`)
}

export async function promoteToAdmin(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify the requester is a superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'Only superadmins can promote users' }
  }

  const targetEmail = formData.get('email') as string
  
  // Update the user's profile to admin
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', targetEmail)

  if (error) return { error: error.message }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function resetUserPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify the requester is a superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return { error: 'Only superadmins can reset passwords' }
  }

  const targetEmail = formData.get('email') as string
  const newPassword = formData.get('new_password') as string

  // Note: Finding a user by email to reset password requires the Admin API.
  // The Supabase Auth Admin API lets us update users directly.
  
  // 1. First find the user ID by email (we can query auth.users if we use the admin client, 
  // but it's easier to query our profiles table first)
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', targetEmail)
    .single()

  if (!targetProfile) return { error: 'User not found in profiles' }

  // 2. Use Admin API to force reset the password
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    targetProfile.id,
    { password: newPassword }
  )

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
