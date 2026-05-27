import { notFound, redirect } from 'next/navigation'
import { getMovieDetails } from '@/lib/tmdb'
import Player from '@/components/player/Player'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function WatchMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/watch/movie/${id}`)

  let movie
  try { movie = await getMovieDetails(Number(id)) } catch { notFound() }

  const { data: prog } = await supabase
    .from('watch_progress')
    .select('current_time_s')
    .eq('user_id', user.id)
    .eq('media_type', 'movie')
    .eq('tmdb_id', movie.id)
    .is('season', null)
    .maybeSingle()

  return (
    <div className="fixed inset-0 bg-black z-50">
      <Link
        href={`/movie/${id}`}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <Player
        type="movie"
        tmdbId={movie.id}
        startSeconds={prog?.current_time_s ?? 0}
        title={movie.title}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
      />
    </div>
  )
}
