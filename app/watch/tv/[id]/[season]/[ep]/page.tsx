import { notFound } from 'next/navigation'
import { getTVDetails, getTVSeason } from '@/lib/tmdb'
import Player from '@/components/player/Player'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function WatchTVPage({
  params,
}: {
  params: Promise<{ id: string; season: string; ep: string }>
}) {
  const { id, season, ep } = await params
  const sNum = Number(season)
  const eNum = Number(ep)

  let show, seasonData
  try {
    ;[show, seasonData] = await Promise.all([
      getTVDetails(Number(id)),
      getTVSeason(Number(id), sNum),
    ])
  } catch { notFound() }

  const episode = seasonData.episodes.find(e => e.episode_number === eNum)
  if (!episode) notFound()

  return (
    <div className="fixed inset-0 bg-black z-50">
      <Link
        href={`/tv/${id}?s=${season}`}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <Player
        type="tv"
        tmdbId={show.id}
        season={sNum}
        episode={eNum}
        title={show.name}
        posterPath={show.poster_path}
        backdropPath={show.backdrop_path}
        episodeTitle={episode.name}
      />
    </div>
  )
}
