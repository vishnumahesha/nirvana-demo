'use client'

import { useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { toggleWatchlist } from '@/app/actions/watchlist'

type Props = {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  title: string
  posterPath: string | null
  initialInWatchlist: boolean
}

export default function WatchlistButton({
  mediaType, tmdbId, title, posterPath, initialInWatchlist,
}: Props) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  function handleClick() {
    const prev = inWatchlist
    setInWatchlist(!prev)
    startTransition(async () => {
      const result = await toggleWatchlist({
        mediaType, tmdbId, title, posterPath,
        inWatchlist: prev,
        path: pathname,
      })
      if (result.error) setInWatchlist(prev)
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10 gap-2 bg-transparent"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : inWatchlist ? (
        <><BookmarkCheck className="w-4 h-4 fill-white" /> In Watchlist</>
      ) : (
        <><Bookmark className="w-4 h-4" /> Add to Watchlist</>
      )}
    </Button>
  )
}
