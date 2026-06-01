// lib/storage.ts

const isClient = typeof window !== 'undefined'

// ── Watch Progress ───────────────────────────────────────────────────────────

export type ProgressData = {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  season: number | null
  episode: number | null
  currentTime: number
  duration: number
  progress: number
  updatedAt: string
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  episodeTitle?: string | null
}

export function progressKey(
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  season?: number | null,
  episode?: number | null
): string {
  if (mediaType === 'tv' && season != null && episode != null) {
    return `progress-tv-${tmdbId}-s${season}-e${episode}`
  }
  return `progress-movie-${tmdbId}`
}

export function getWatchProgress(key: string): ProgressData | null {
  if (!isClient) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ProgressData) : null
  } catch { return null }
}

export function setWatchProgress(key: string, data: ProgressData): void {
  if (!isClient) return
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function getAllProgress(): ProgressData[] {
  if (!isClient) return []
  try {
    const result: ProgressData[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('progress-')) {
        const raw = localStorage.getItem(k)
        if (raw) { try { result.push(JSON.parse(raw) as ProgressData) } catch {} }
      }
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch { return [] }
}

// ── Watchlist ────────────────────────────────────────────────────────────────

export type WatchlistItem = {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  title: string
  posterPath: string | null
  addedAt: string
}

const WATCHLIST_KEY = 'mirawatch-watchlist'

export function getWatchlist(): WatchlistItem[] {
  if (!isClient) return []
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : []
  } catch { return [] }
}

export function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): void {
  if (!isClient) return
  try {
    const list = getWatchlist()
    if (!list.find(i => i.tmdbId === item.tmdbId && i.mediaType === item.mediaType)) {
      list.unshift({ ...item, addedAt: new Date().toISOString() })
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list))
    }
  } catch {}
}

export function removeFromWatchlist(tmdbId: number, mediaType: 'movie' | 'tv'): void {
  if (!isClient) return
  try {
    const list = getWatchlist().filter(
      i => !(i.tmdbId === tmdbId && i.mediaType === mediaType)
    )
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list))
  } catch {}
}

export function isInWatchlist(tmdbId: number, mediaType: 'movie' | 'tv'): boolean {
  return getWatchlist().some(i => i.tmdbId === tmdbId && i.mediaType === mediaType)
}

// ── Preferences ──────────────────────────────────────────────────────────────

export type UserPreferences = {
  preferredGenres: number[]
  preferredMediaType: 'movies' | 'tv' | 'both'
  onboarded: boolean
}

const PREFS_KEY = 'mirawatch-preferences'
const DEFAULT_PREFS: UserPreferences = {
  preferredGenres: [],
  preferredMediaType: 'both',
  onboarded: false,
}

export function getPreferences(): UserPreferences {
  if (!isClient) return DEFAULT_PREFS
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? (JSON.parse(raw) as UserPreferences) : DEFAULT_PREFS
  } catch { return DEFAULT_PREFS }
}

export function setPreferences(prefs: UserPreferences): void {
  if (!isClient) return
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch {}
}
