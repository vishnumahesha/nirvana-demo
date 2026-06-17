'use client'

import { useState } from 'react'

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Demo mockup banner */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-slate-100 border-b border-slate-200 flex items-center justify-center py-1.5">
        <p className="text-[11px] text-slate-400 tracking-wide uppercase font-medium">
          Demo Mockup &mdash; not the live Nirvana Systems site
        </p>
      </div>

      {/* Main navigation */}
      <header className="fixed top-7 left-0 right-0 z-[150] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2.5 no-underline">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="14,2 26,24 2,24" fill="#1D4ED8" />
              <polygon points="14,8 22,22 6,22" fill="#3b82f6" opacity="0.5" />
            </svg>
            <span className="text-slate-900 font-semibold text-lg tracking-tight" style={{ fontFamily: 'var(--font-sora)' }}>
              Nirvana Systems
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            {['OmniFunds', 'Track Record', 'Pricing', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                {item}
              </a>
            ))}
            <a
              href="/live-agent"
              className="hover:text-[#1D4ED8] transition-colors"
            >
              Live Agent
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden sm:inline-flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              Book a Free Demo
            </a>
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileOpen
                  ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4">
            {['OmniFunds', 'Track Record', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-slate-600 hover:text-[#1D4ED8] text-sm transition-colors"
                onClick={() => setMobileOpen(false)}>
                {item}
              </a>
            ))}
            <a href="/live-agent"
              className="text-slate-600 hover:text-[#1D4ED8] text-sm transition-colors"
              onClick={() => setMobileOpen(false)}>
              Live Agent
            </a>
            <a href="#demo"
              className="inline-flex justify-center items-center bg-[#1D4ED8] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              Book a Free Demo
            </a>
          </div>
        )}
      </header>
    </>
  )
}
