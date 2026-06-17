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
      {/* Parent needs explicit width/height — the inline widget fills it. */}
      <div className="fixed inset-0 z-[100] h-[100dvh] w-screen bg-black">
        <anam-agent
          agent-id="31088c6e-11e9-42a3-8fa5-63adec1fc579"
          layout="inline"
          ui-text-input="true"
        ></anam-agent>
      </div>
    </>
  )
}
