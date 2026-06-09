'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getWatchProgress, setWatchProgress, progressKey, type ProgressData } from '@/lib/storage'
import { vidkingUrl, vidsrcUrl, SOURCE_LABELS, type Source } from '@/lib/streams'

type Props = {
  type: 'movie' | 'tv'
  tmdbId: number
  season?: number
  episode?: number
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  episodeTitle?: string | null
  backHref?: string
}

type PlayerEventPayload = {
  currentTime: number
  duration: number
  progress: number
}

const DEBOUNCE_MS = 5000
const VIDKING_ORIGIN = 'https://www.vidking.net'

export default function Player({
  type, tmdbId, season, episode,
  title, posterPath, backdropPath, episodeTitle,
}: Props) {
  const key = progressKey(type, tmdbId, season, episode)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [startSeconds, setStartSeconds] = useState<number | null>(null)
  const [source, setSource] = useState<Source>('vidking')

  // Read resume position from localStorage
  useEffect(() => {
    const saved = getWatchProgress(key)
    setStartSeconds(saved?.currentTime ?? 0)
  }, [key])

  const saveProgress = useCallback(
    (payload: PlayerEventPayload) => {
      if (!payload.duration || payload.duration < 1) return
      const data: ProgressData = {
        mediaType: type,
        tmdbId,
        season: season ?? null,
        episode: episode ?? null,
        currentTime: payload.currentTime,
        duration: payload.duration,
        progress: payload.progress,
        updatedAt: new Date().toISOString(),
        title: title ?? undefined,
        posterPath: posterPath ?? null,
        backdropPath: backdropPath ?? null,
        episodeTitle: episodeTitle ?? null,
      }
      setWatchProgress(key, data)
    },
    [key, type, tmdbId, season, episode, title, posterPath, backdropPath, episodeTitle]
  )

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== VIDKING_ORIGIN) return
      let msg: { type?: string; data?: PlayerEventPayload & { event?: string } } | null = null
      try { msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }
      if (!msg || msg.type !== 'PLAYER_EVENT' || !msg.data) return

      const { event, ...rest } = msg.data

      if (event === 'timeupdate') {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => saveProgress(rest as PlayerEventPayload), DEBOUNCE_MS)
      } else if (event === 'pause' || event === 'ended' || event === 'seeked') {
        if (timerRef.current) clearTimeout(timerRef.current)
        saveProgress(rest as PlayerEventPayload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [saveProgress])

  if (startSeconds === null) return <div className="w-full h-full bg-black" />

  const src = source === 'vidking'
    ? vidkingUrl(type, tmdbId, season, episode, startSeconds)
    : vidsrcUrl(type, tmdbId, season, episode)

  const otherSource: Source = source === 'vidking' ? 'vidsrc' : 'vidking'

  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        key={`${source}-${startSeconds}`}
        src={src}
        className="flex-1 w-full"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
      <div className="flex justify-center py-2 bg-black">
        <button
          onClick={() => setSource(otherSource)}
          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors px-3 py-1 rounded hover:bg-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try {SOURCE_LABELS[otherSource]}
        </button>
      </div>
    </div>
  )
}
