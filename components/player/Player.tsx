'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { getWatchProgress, setWatchProgress, progressKey, type ProgressData } from '@/lib/storage'

type Props = {
  type: 'movie' | 'tv'
  tmdbId: number
  season?: number
  episode?: number
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  episodeTitle?: string | null
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

  const src =
    type === 'movie'
      ? `${VIDKING_ORIGIN}/embed/movie/${tmdbId}?color=e50914&autoPlay=true&progress=${startSeconds}`
      : `${VIDKING_ORIGIN}/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true&progress=${startSeconds}`

  return (
    <iframe
      src={src}
      className="w-full h-full"
      allow="fullscreen; autoplay; encrypted-media"
      allowFullScreen
    />
  )
}
