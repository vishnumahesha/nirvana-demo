'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from '@/lib/storage'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Play, Bookmark, X } from 'lucide-react'

export default function WatchlistPage() {
  const [list, setList] = useState<WatchlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setList(getWatchlist())
    setMounted(true)
  }, [])

  function handleRemove(tmdbId: number, mediaType: 'movie' | 'tv') {
    removeFromWatchlist(tmdbId, mediaType)
    setList(prev => prev.filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType)))
  }

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
        </div>
        {mounted && list.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <Bookmark className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-gray-400">Your watchlist is empty.</p>
            <p className="text-gray-500 text-sm">
              Browse{' '}
              <Link href="/" className="text-brand hover:underline">movies and TV shows</Link>{' '}
              and add them here.
            </p>
          </div>
        ) : (
          <>
            {mounted && <p className="text-gray-500 text-sm">{list.length} title{list.length !== 1 ? 's' : ''}</p>}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {list.map((item) => {
                const href = `/${item.mediaType}/${item.tmdbId}`
                return (
                  <div key={`${item.mediaType}-${item.tmdbId}`} className="relative group">
                    <Link href={href}>
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800">
                        {item.posterPath ? (
                          <Image
                            src={`${TMDB_IMAGE_BASE}/w342${item.posterPath}`}
                            alt={item.title ?? ''}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 144px, 176px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">No image</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <p className="text-sm text-white leading-tight truncate mt-1.5 px-0.5">{item.title}</p>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.tmdbId, item.mediaType)}
                      className="absolute top-1 left-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80"
                      title="Remove from watchlist"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
