'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Tv, Search, LogOut, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

export default function Nav({ user }: { user: User | null }) {
  const router = useRouter()

  async function signOut() {
    await getSupabaseBrowser().auth.signOut()
    router.refresh()
  }

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand">
          <Tv className="w-6 h-6" />
          Vidstream
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-brand text-white text-sm font-medium">
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                <DropdownMenuItem asChild>
                  <Link href="/watchlist" className="flex items-center gap-2 cursor-pointer">
                    <Bookmark className="w-4 h-4" /> Watchlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-950"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
