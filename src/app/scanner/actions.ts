'use server'

import { createClient } from '@/utils/supabase/server'

export async function processScan(qrData: any, sessionId: string) {
  const supabase = await createClient()

  // 1. Validate data
  if (!qrData.studentId || !qrData.timestamp) return { error: "Invalid QR Data" }

  // 2. The Honeypot Logic (Calculate the delay)
  const scanTime = Date.now()
  const delaySeconds = Math.floor((scanTime - qrData.timestamp) / 1000)
  // 3. Find the profile UUID by matching the 14-digit studentId
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, major, level')
    .eq('student_id', qrData.studentId)
    .single()

  if (!profile) return { error: "Student profile not found in database" }

  // 3.5 Check class level and major
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('class_id, classes(level, major)')
    .eq('id', sessionId)
    .single()

  let isFlagged = delaySeconds > 25
  let flagReason = isFlagged ? `Scanned ${delaySeconds}s after generation. Suspected screenshot.` : null

  if (sessionData?.classes) {
    const classInfo = sessionData.classes as any

    // Check Level
    if (classInfo.level && String(profile.level) !== String(classInfo.level)) {
      isFlagged = true
      const levelReason = `Wrong Level: Student is Lvl ${profile.level}, Class is Lvl ${classInfo.level}`
      flagReason = flagReason ? `${flagReason} | ${levelReason}` : levelReason
    }

    // Check Major
    if (classInfo.major && String(profile.major) !== String(classInfo.major)) {
      isFlagged = true
      const majorReason = `Wrong Major: Student is ${profile.major}, Class is ${classInfo.major}`
      flagReason = flagReason ? `${flagReason} | ${majorReason}` : majorReason
    }
  }

  // 4. Insert into attendance_records 
  // We insert 'Present' unconditionally to maintain the illusion, 
  // but we attach the hidden flag data.
  const { error } = await supabase.from('attendance_records').insert({
    session_id: sessionId,
    student_id: profile.id,
    status: 'Present',
    is_flagged: isFlagged,
    flag_reason: flagReason,
    scan_delay_seconds: delaySeconds,
    student_ip: qrData.ip || 'Unknown'
  })

  if (error) {
    // If it's a unique constraint violation (they already scanned in), that's fine.
    if (error.code === '23505') {
        return { 
          success: true, 
          note: 'Already scanned',
          student: {
            name: profile.full_name,
            id: qrData.studentId,
            major: profile.major || 'N/A',
            level: profile.level || '-',
            isCheater: isFlagged,
            flagReason: flagReason
          }
        }
    }
    return { error: error.message }
  }

  return { 
    success: true,
    student: {
      name: profile.full_name,
      id: qrData.studentId,
      major: profile.major || 'N/A',
      level: profile.level || '-',
      isCheater: isFlagged,
      flagReason: flagReason
    }
  }
}
