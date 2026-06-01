import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMovieDetails, TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Star, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import WatchlistButton from '@/components/media/WatchlistButton'

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let movie
  try { movie = await getMovieDetails(Number(id)) } catch { notFound() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let inWatchlist = false
  if (user) {
    const { data } = await supabase
      .from('watchlist')
      .select('tmdb_id')
      .eq('user_id', user.id)
      .eq('tmdb_id', movie.id)
      .eq('media_type', 'movie')
      .maybeSingle()
    inWatchlist = !!data
  }

  const backdrop = movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null
  const poster = movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null

  return (
    <div className="min-h-screen">
      {backdrop && (
        <div className="relative h-[50vh]">
          <Image src={backdrop} alt={movie.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      <div className={`max-w-5xl mx-auto px-4 md:px-8 pb-16 ${backdrop ? '-mt-32 relative z-10' : 'pt-24'}`}>
        <div className="flex flex-col md:flex-row gap-8">
          {poster && (
            <div className="flex-none w-48 md:w-64 hidden md:block">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image src={poster} alt={movie.title} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1 space-y-4 pt-4 md:pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{movie.title}</h1>
            {movie.tagline && <p className="text-gray-400 italic">{movie.tagline}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(g => (
                <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-gray-300 border-0">
                  {g.name}
                </Badge>
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-brand hover:bg-brand/90 text-white gap-2">
                <Link href={`/watch/movie/${movie.id}`}>
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </Link>
              </Button>
              <WatchlistButton
                mediaType="movie"
                tmdbId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                initialInWatchlist={inWatchlist}
                hasSession={!!user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
