export default function PhoneCTA() {
  return (
    <div className="bg-[#f8fafc] px-4 py-4">
      <div className="max-w-5xl mx-auto">
        <a
          href="tel:+18339977785"
          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white border border-[#bfdbfe] rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-[#1D4ED8] transition-all group"
        >
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center group-hover:bg-[#1D4ED8] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 0118 1.18a2 2 0 012 1.72 12.84 12.84 0 01.7 2.81 2 2 0 01-.45 1.67L18.91 9a16 16 0 006.09 6.09z" />
              </svg>
            </div>
            <span className="text-[#1D4ED8] font-bold text-lg tracking-tight group-hover:text-[#1e40af] transition-colors">
              (833) 997-7785
            </span>
          </div>

          <div className="flex-1">
            <p className="text-slate-700 text-sm font-medium">
              Try our AI support agent by phone
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Demo line. You may hear a brief trial-account message first — just press any key to connect.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[#1D4ED8] text-xs font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            Call now
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  )
}
