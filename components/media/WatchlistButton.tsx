'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/storage'

type Props = {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  title: string
  posterPath: string | null
}

export default function WatchlistButton({ mediaType, tmdbId, title, posterPath }: Props) {
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    setInWatchlist(isInWatchlist(tmdbId, mediaType))
  }, [tmdbId, mediaType])

  function handleClick() {
    if (inWatchlist) {
      removeFromWatchlist(tmdbId, mediaType)
      setInWatchlist(false)
    } else {
      addToWatchlist({ tmdbId, mediaType, title, posterPath })
      setInWatchlist(true)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10 gap-2 bg-transparent"
    >
      {inWatchlist ? (
        <><BookmarkCheck className="w-4 h-4 fill-white" /> In Watchlist</>
      ) : (
        <><Bookmark className="w-4 h-4" /> Add to Watchlist</>
      )}
    </Button>
  )
}
