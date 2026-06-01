'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Episode } from '@/lib/tmdb'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Play, Clock } from 'lucide-react'
import { getWatchProgress, progressKey } from '@/lib/storage'

type Props = {
  showId: number
  seasonNum: number
  episode: Episode
  progress: number
}

export default function EpisodeCard({ showId, seasonNum, episode, progress }: Props) {
  const [localProgress, setLocalProgress] = useState(progress)

  useEffect(() => {
    const saved = getWatchProgress(progressKey('tv', showId, seasonNum, episode.episode_number))
    if (saved) setLocalProgress(saved.progress)
  }, [showId, seasonNum, episode.episode_number])

  const href = `/watch/tv/${showId}/${seasonNum}/${episode.episode_number}`
  const thumb = episode.still_path ? `${TMDB_IMAGE_BASE}/w300${episode.still_path}` : null
  const showBar = localProgress > 0.04 && localProgress < 0.96

  return (
    <Link
      href={href}
      className="flex gap-4 p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors group border border-white/5"
    >
      <div className="flex-none w-32 md:w-40 relative aspect-video rounded-lg overflow-hidden bg-zinc-800">
        {thumb ? (
          <Image src={thumb} alt={episode.name} fill className="object-cover" sizes="160px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-5 h-5 text-zinc-600" />
          </div>
        )}
        {showBar && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
            <div className="h-full bg-brand" style={{ width: `${localProgress * 100}%` }} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start gap-2">
          <span className="text-gray-500 text-sm flex-none">{episode.episode_number}.</span>
          <h3 className="text-white font-medium text-sm leading-tight line-clamp-1">{episode.name}</h3>
        </div>
        {episode.runtime && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> {episode.runtime}m
          </p>
        )}
        {episode.overview && (
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">{episode.overview}</p>
        )}
      </div>
    </Link>
  )
}
