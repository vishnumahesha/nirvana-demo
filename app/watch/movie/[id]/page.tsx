import { notFound } from 'next/navigation'
import { getMovieDetails } from '@/lib/tmdb'
import Player from '@/components/player/Player'
import AdblockBanner from '@/components/AdblockBanner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function WatchMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let movie
  try { movie = await getMovieDetails(Number(id)) } catch { notFound() }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <AdblockBanner />
      <div className="relative flex-1">
      <Link
        href={`/movie/${id}`}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <Player
        type="movie"
        tmdbId={movie.id}
        title={movie.title}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
        backHref={`/movie/${id}`}
      />
      </div>
    </div>
  )
}
