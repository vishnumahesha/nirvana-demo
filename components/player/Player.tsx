'use client'

import { useEffect, useRef, useCallback } from 'react'

type Props = {
  type: 'movie' | 'tv'
  tmdbId: number
  season?: number
  episode?: number
  startSeconds?: number
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  episodeTitle?: string | null
}

type PlayerEventPayload = {
  event: string
  currentTime: number
  duration: number
  progress: number
}

const DEBOUNCE_MS = 5000
const VIDKING_ORIGIN = 'https://www.vidking.net'

export default function Player({
  type, tmdbId, season, episode, startSeconds = 0,
  title, posterPath, backdropPath, episodeTitle,
}: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const src =
    type === 'movie'
      ? `${VIDKING_ORIGIN}/embed/movie/${tmdbId}?color=e50914&autoPlay=true&progress=${startSeconds}`
      : `${VIDKING_ORIGIN}/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true&progress=${startSeconds}`

  const saveProgress = useCallback(
    async (payload: PlayerEventPayload) => {
      if (!payload.duration || payload.duration < 1) return
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: type,
          tmdb_id: tmdbId,
          season: season ?? null,
          episode: episode ?? null,
          current_time_s: payload.currentTime,
          duration_s: payload.duration,
          progress: payload.progress,
          title,
          poster_path: posterPath ?? null,
          backdrop_path: backdropPath ?? null,
          episode_title: episodeTitle ?? null,
        }),
      })
    },
    [type, tmdbId, season, episode, title, posterPath, backdropPath, episodeTitle]
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

  return (
    <iframe
      src={src}
      className="w-full h-full"
      allow="fullscreen; autoplay; encrypted-media"
      allowFullScreen
    />
  )
}
