'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function LiveAgentPage() {
  // This route inherits the global Mirawatch <Nav /> from the root layout.
  // Hide it so the agent renders truly full-bleed with no shared chrome.
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'live-agent-override'
    style.textContent = `header.fixed { display: none !important; }`
    document.head.appendChild(style)
    return () => {
      document.getElementById('live-agent-override')?.remove()
    }
  }, [])

  return (
    <>
      <Script
        src="https://unpkg.com/@anam-ai/agent-widget"
        strategy="afterInteractive"
      />
      {/* Global nav is hidden here, so give users a way back to the site. */}
      <a
        href="/nirvana"
        className="fixed top-4 left-4 z-[110] inline-flex items-center gap-1.5 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white"
      >
        &larr; Back to site
      </a>

      {/* Parent needs explicit width/height — the inline widget fills it. */}
      <div className="fixed inset-0 z-[100] h-[100dvh] w-screen bg-black">
        <anam-agent
          agent-id="31088c6e-11e9-42a3-8fa5-63adec1fc579"
          layout="inline"
          ui-text-input="true"
          call-to-action="Start a call"
        ></anam-agent>
      </div>
    </>
  )
}
