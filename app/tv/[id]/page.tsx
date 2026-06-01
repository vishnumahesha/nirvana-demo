import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTVDetails, getTVSeason, TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Star } from 'lucide-react'
import WatchlistButton from '@/components/media/WatchlistButton'
import EpisodeCard from '@/components/media/EpisodeCard'
import SeasonSelector from '@/components/tv/SeasonSelector'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const show = await getTVDetails(Number(id))
    return { title: `${show.name} — Mirawatch` }
  } catch {
    return { title: 'Mirawatch' }
  }
}

export default async function TVPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ s?: string }>
}) {
  const [{ id }, { s }] = await Promise.all([params, searchParams])

  let show
  try { show = await getTVDetails(Number(id)) } catch { notFound() }

  const mainSeasons = show.seasons.filter(sn => sn.season_number > 0)
  const seasonNum = Number(s ?? mainSeasons[0]?.season_number ?? 1)

  let seasonData
  try { seasonData = await getTVSeason(Number(id), seasonNum) } catch { notFound() }

  const backdrop = show.backdrop_path ? `${TMDB_IMAGE_BASE}/original${show.backdrop_path}` : null
  const poster = show.poster_path ? `${TMDB_IMAGE_BASE}/w500${show.poster_path}` : null

  return (
    <div className="min-h-screen">
      {backdrop && (
        <div className="relative h-[50vh]">
          <Image src={backdrop} alt={show.name} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      <div className={`max-w-5xl mx-auto px-4 md:px-8 pb-16 ${backdrop ? '-mt-32 relative z-10' : 'pt-24'}`}>
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {poster && (
            <div className="flex-none w-48 md:w-64 hidden md:block">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image src={poster} alt={show.name} fill className="object-cover" sizes="256px" />
              </div>
            </div>
          )}
          <div className="flex-1 space-y-4 pt-4 md:pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{show.name}</h1>
            {show.tagline && <p className="text-gray-400 italic">{show.tagline}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {show.first_air_date && <span>{show.first_air_date.slice(0, 4)}</span>}
              <span>{show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {show.vote_average.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {show.genres.map(g => (
                <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-gray-300 border-0">
                  {g.name}
                </Badge>
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">{show.overview}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-brand hover:bg-brand/90 text-white gap-2">
                <Link href={`/watch/tv/${show.id}/1/1`}>
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </Link>
              </Button>
              <WatchlistButton
                mediaType="tv"
                tmdbId={show.id}
                title={show.name}
                posterPath={show.poster_path}
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {mainSeasons.length > 1 && (
            <SeasonSelector showId={show.id} seasons={mainSeasons} currentSeason={seasonNum} />
          )}
          <div className="space-y-3">
            {seasonData.episodes.map(ep => (
              <EpisodeCard
                key={ep.id}
                showId={show.id}
                seasonNum={seasonNum}
                episode={ep}
                progress={0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
