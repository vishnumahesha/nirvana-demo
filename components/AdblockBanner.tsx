'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'mirawatch-adblock-dismissed'

export default function AdblockBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="w-full bg-zinc-900/80 border-b border-white/10 px-4 py-2 flex items-center justify-between gap-4 text-xs text-gray-400">
      <p>
        💡 Tip: Popup ads come from the streaming source.{' '}
        <Link href="/adblock" className="text-gray-300 underline hover:text-white transition-colors">
          Install an ad blocker
        </Link>{' '}
        for a clean experience.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-none text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
