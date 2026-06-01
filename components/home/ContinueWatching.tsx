'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getAllProgress, type ProgressData } from '@/lib/storage'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Play } from 'lucide-react'

export default function ContinueWatching() {
  const [items, setItems] = useState<ProgressData[]>([])

  useEffect(() => {
    const all = getAllProgress()
      .filter(p => p.progress >= 0.05 && p.progress < 0.95)
      .slice(0, 10)
    setItems(all)
  }, [])

  if (items.length === 0) return null

  return (
    <section className="px-4 md:px-8 space-y-3">
      <h2 className="text-lg font-semibold text-white">Continue Watching</h2>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
        {items.map((item, i) => {
          const href =
            item.mediaType === 'movie'
              ? `/watch/movie/${item.tmdbId}`
              : `/watch/tv/${item.tmdbId}/${item.season}/${item.episode}`
          return (
            <Link key={i} href={href} className="snap-start flex-none w-36 md:w-44 group">
              <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800">
                {item.posterPath && (
                  <Image
                    src={`${TMDB_IMAGE_BASE}/w342${item.posterPath}`}
                    alt={item.title ?? ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-700">
                  <div className="h-full bg-brand" style={{ width: `${item.progress * 100}%` }} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{item.title}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
