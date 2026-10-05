'use client'

import { useState } from 'react'
import { ShieldAlert, Plus, Settings, QrCode, Trash2 } from 'lucide-react'
import { promoteToAdmin, resetUserPassword } from '@/app/admin/actions'
import Link from 'next/link'
import { addClass, deleteClass } from '@/app/admin/actions'

export default function AdminView({ 
  profile, 
  students, 
  sessions, 
  attendance,
  classes = []
}: { 
  profile: any, 
  students: any[], 
  sessions: any[], 
  attendance: any[],
  classes?: any[]
}) {
  const [classToDelete, setClassToDelete] = useState<string | null>(null)

  return (
    <div className="space-y-8 relative">
      {/* Delete Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Class?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Are you sure you want to delete this class? This will permanently delete all attendance records for it.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setClassToDelete(null)} className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
              <form action={async (fd) => { 
                await deleteClass(fd); 
                setClassToDelete(null); 
              }}>
                <input type="hidden" name="class_id" value={classToDelete} />
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition">Yes, Delete</button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Classes Management */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <QrCode className="text-blue-500" />
            My Classes
          </h2>
          
          <div className="space-y-4 mb-8">
            {classes.length === 0 ? (
              <p className="text-slate-500">No classes created yet.</p>
            ) : (
              classes.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-sm text-slate-500">Level {c.level} {c.major && `• ${c.major}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setClassToDelete(c.id)}
                      title="Delete Class"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link 
                      href={`/classes/${c.id}`} 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition"
                    >
                      Open Class
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Plus className="text-emerald-500" />
            Add New Class
          </h2>
          <form action={async (fd) => { await addClass(fd) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Class Name (Subject)</label>
              <input type="text" name="name" required placeholder="e.g. Advanced AI" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Level</label>
                <select name="level" required className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Major</label>
                <select name="major" required className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="AI">AI</option>
                  <option value="AVI">AVI</option>
                  <option value="MED">MED</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">
              Create Class
            </button>
          </form>
        </div>
      </div>

      {profile.role === 'superadmin' && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Promote User Card */}
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
            <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">Manage Roles</h2>
            <form action={async (fd) => { await promoteToAdmin(fd) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">User's Email to Promote</label>
                <input type="email" name="email" required placeholder="dr.smith@example.com" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
                <Plus size={18} />
                Make Admin
              </button>
            </form>
          </div>

          {/* Reset Password Card */}
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Settings className="text-orange-500" />
              Reset Password
            </h2>
            <form action={async (fd) => { await resetUserPassword(fd) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Email</label>
                <input type="email" name="email" required placeholder="student@example.com" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input type="password" name="new_password" required minLength={8} placeholder="••••••••" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-50 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700">
                Force Reset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* All Students List */}
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-50">All Students Overview</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Major</th>
                <th className="px-4 py-3 font-medium text-center">Level</th>
                <th className="px-4 py-3 font-medium">Attendance ({sessions.length})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {students.map((student) => {
                // Determine major/level if they exist, else placeholder
                const major = student.major || 'N/A'
                const level = student.level || '-'
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-50">
                      {student.full_name}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
                        {major}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium">
                      {level}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {sessions.map(session => {
                          const attended = attendance.some(a => a.student_id === student.id && a.session_id === session.id)
                          return (
                            <div 
                              key={session.id} 
                              title={`${session.title}: ${attended ? 'Present' : 'Absent'}`}
                              className={`w-3 h-3 rounded-full ${attended ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                            />
                          )
                        })}
                        {sessions.length === 0 && <span className="text-xs italic text-slate-400">No sessions yet</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
