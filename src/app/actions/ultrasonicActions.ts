'use server'

import { createClient } from '@/utils/supabase/server'

// OBLIVIATE_ULTRASONIC
export async function recordUltrasonicAttendance() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not logged in" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, major, level')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: "Profile not found" }

  // Find the most recent active session that matches the student's level and major
  // A session is considered active if it was created in the last 2 hours.
  // We can just fetch recent sessions and find one that matches.
  
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id, class_id, classes(level, major)')
    .gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false })

  if (!recentSessions || recentSessions.length === 0) {
    return { error: "No active sessions found right now." }
  }

  // Find a session that matches the student's class requirements
  const matchingSession = recentSessions.find((session: any) => {
    const classInfo = session.classes
    if (!classInfo) return false
    
    const levelMatches = !classInfo.level || String(classInfo.level) === String(profile.level)
    const majorMatches = !classInfo.major || String(classInfo.major) === String(profile.major)
    
    return levelMatches && majorMatches
  })

  if (!matchingSession) {
    return { error: "No active session matching your level/major found." }
  }

  // Record attendance
  const { error } = await supabase.from('attendance_records').insert({
    session_id: matchingSession.id,
    student_id: profile.id,
    status: 'Present',
    is_flagged: false, // Ultrasonic is considered safe and real-time
    flag_reason: 'Ultrasonic Verified',
    scan_delay_seconds: 0
  })

  if (error) {
    if (error.code === '23505') {
      return { success: true, note: "Already recorded" }
    }
    return { error: error.message }
  }

  return { success: true, session: matchingSession.id }
}
