export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full mt-auto py-8 px-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        
        {/* About Section */}
        <div className="text-center md:text-left">
          <p className="font-medium text-slate-700 dark:text-slate-300">Attendance Portal</p>
          <p className="mt-1 max-w-sm">Wishing all students a successful academic year! Consistent attendance is key to your success, so please make sure to scan your QR code at every session.</p>
        </div>

        {/* Signature & Copyright */}
        <div className="text-center md:text-right flex flex-col gap-1">
          <p>
            Made by <span className="font-semibold text-slate-800 dark:text-slate-200">Mahmoud Fathy <span className="text-blue-600 dark:text-blue-400 font-black tracking-wide">Th</span></span>
          </p>
          <p>&copy; {currentYear} All Rights Reserved</p>
        </div>
        
      </div>
    </footer>
  )
}
