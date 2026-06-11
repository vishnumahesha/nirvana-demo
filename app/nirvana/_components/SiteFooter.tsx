'use client'

import { useState } from 'react'

export default function SiteFooter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand + email signup */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,24 2,24" fill="#3b82f6" />
              </svg>
              <span className="text-white font-semibold text-base">Nirvana Systems</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Algorithmic trading solutions for equities. Backed by 30+ years of experience
              and a 12-month performance guarantee.
            </p>

            {submitted ? (
              <p className="text-sm text-emerald-400 font-medium">Thanks! We will be in touch.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-full px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-[#3b82f6] min-w-0"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-xs text-slate-600 mt-2">Subscribe to stay updated</p>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {['Privacy Policy', 'Disclaimer', 'Terms & Conditions'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {['About', 'Contact', 'Directors'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Support line */}
        <div className="border-t border-slate-800 pt-8 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Need customer support?{' '}
            <a
              href="tel:+18339977785"
              className="text-white font-semibold hover:text-blue-400 transition-colors"
            >
              +1 (833) 997-7785
            </a>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-800 px-3 py-1.5 rounded-full">
            <svg width="10" height="10" viewBox="0 0 20 20" fill="#4b5563">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Demo line — trial message may play first
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; 2024 Nirvana Systems. All rights reserved.</p>
          <p>OmniFunds is a licensed software product, not an investment advisor.</p>
        </div>
      </div>
    </footer>
  )
}
