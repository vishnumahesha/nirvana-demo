import { z } from 'zod'

const TMDB_BASE = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// ── Schemas ──────────────────────────────────────────────────────────────────

const GenreSchema = z.object({ id: z.number(), name: z.string() })

export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  tagline: z.string().default(''),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().default(''),
  vote_average: z.number(),
  vote_count: z.number(),
  runtime: z.number().nullable(),
  genres: z.array(GenreSchema),
})

export const TVShowSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  tagline: z.string().default(''),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().default(''),
  vote_average: z.number(),
  vote_count: z.number(),
  genres: z.array(GenreSchema),
  number_of_seasons: z.number(),
  seasons: z.array(
    z.object({
      id: z.number(),
      season_number: z.number(),
      name: z.string(),
      episode_count: z.number(),
      poster_path: z.string().nullable(),
    })
  ),
})

export const EpisodeSchema = z.object({
  id: z.number(),
  episode_number: z.number(),
  name: z.string(),
  overview: z.string().default(''),
  still_path: z.string().nullable(),
  runtime: z.number().nullable(),
  air_date: z.string().nullable(),
})

export const SeasonSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  name: z.string(),
  episodes: z.array(EpisodeSchema),
})

export const MediaItemSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number().default(0),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  media_type: z.string().optional(),
  overview: z.string().default(''),
})

export const MediaListSchema = z.object({
  results: z.array(MediaItemSchema),
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
})

export type Movie = z.infer<typeof MovieSchema>
export type TVShow = z.infer<typeof TVShowSchema>
export type Episode = z.infer<typeof EpisodeSchema>
export type Season = z.infer<typeof SeasonSchema>
export type MediaItem = z.infer<typeof MediaItemSchema>

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function tmdbFetch<T>(
  schema: z.ZodType<T>,
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE}/${path}`)
  url.searchParams.set('api_key', process.env.TMDB_API_KEY!)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`)
  return schema.parse(await res.json())
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const getTrending = (
  type: 'all' | 'movie' | 'tv' = 'all',
  window: 'day' | 'week' = 'week'
) => tmdbFetch(MediaListSchema, `trending/${type}/${window}`)

export const getPopularMovies = () => tmdbFetch(MediaListSchema, 'movie/popular')
export const getPopularTV = () => tmdbFetch(MediaListSchema, 'tv/popular')
export const getTopRatedMovies = () => tmdbFetch(MediaListSchema, 'movie/top_rated')
export const getTopRatedTV = () => tmdbFetch(MediaListSchema, 'tv/top_rated')
export const getMovieDetails = (id: number) => tmdbFetch(MovieSchema, `movie/${id}`)
export const getTVDetails = (id: number) => tmdbFetch(TVShowSchema, `tv/${id}`)
export const getTVSeason = (id: number, season: number) =>
  tmdbFetch(SeasonSchema, `tv/${id}/season/${season}`)
export const searchMulti = (query: string) =>
  tmdbFetch(MediaListSchema, 'search/multi', { query })
