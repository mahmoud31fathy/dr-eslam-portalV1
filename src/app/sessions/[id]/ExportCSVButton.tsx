'use client'

import { Download } from 'lucide-react'

export default function ExportCSVButton({ 
  records, 
  sessionTitle, 
  className 
}: { 
  records: any[], 
  sessionTitle: string,
  className?: string 
}) {
  const handleDownload = () => {
    // CSV Header
    const headers = ['Student Name', 'Student ID', 'Email', 'Major', 'Level', 'Scanned At']
    
    // CSV Rows
    const rows = records.map(record => [
      `"${record.profiles.full_name}"`,
      `"${record.profiles.student_id}"`,
      `"${record.profiles.email}"`,
      `"${record.profiles.major}"`,
      `"${record.profiles.level}"`,
      `"${new Date(record.scanned_at).toLocaleString()}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${sessionTitle.replace(/\s+/g, '_')}_Attendance.csv`)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button 
      onClick={handleDownload}
      className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm ${className || ''}`}
    >
      <Download size={18} />
      Export as CSV
    </button>
  )
}
