'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShieldOff } from 'lucide-react'

// Routes that render their own chrome (or none) and must not show the global nav.
const HIDDEN_PREFIXES = ['/nirvana', '/live-agent']

export default function Nav() {
  const pathname = usePathname()
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null
  }

  return (
    <header id="mirawatch-global-nav" className="fixed top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl text-brand tracking-tight">
            Mirawatch
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/movies" className="text-gray-400 hover:text-white transition-colors">Movies</Link>
            <Link href="/tv" className="text-gray-400 hover:text-white transition-colors">TV</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/adblock" className="text-gray-400 hover:text-white transition-colors" title="Block ads">
            <ShieldOff className="w-5 h-5" />
          </Link>
          <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
