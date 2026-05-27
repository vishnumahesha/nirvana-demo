import Image from 'next/image'
import Link from 'next/link'
import { getTrending, TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Button } from '@/components/ui/button'
import { Play, Info } from 'lucide-react'

export default async function Hero() {
  const trending = await getTrending('all', 'week')
  const item = trending.results.find(r => r.backdrop_path) ?? trending.results[0]
  if (!item) return null

  const title = item.title ?? item.name ?? ''
  const type = item.media_type === 'movie' ? 'movie' : 'tv'
  const watchHref = type === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/1/1`

  return (
    <div className="relative h-[85vh] w-full">
      {item.backdrop_path && (
        <Image
          src={`${TMDB_IMAGE_BASE}/original${item.backdrop_path}`}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-end pb-24 px-4 md:px-8">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            {title}
          </h1>
          {item.overview && (
            <p className="text-gray-300 text-sm md:text-base line-clamp-3 drop-shadow">
              {item.overview}
            </p>
          )}
          <div className="flex gap-3">
            <Button asChild className="bg-brand hover:bg-brand/90 text-white gap-2">
              <Link href={watchHref}>
                <Play className="w-4 h-4 fill-white" /> Watch Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 gap-2 bg-white/5 backdrop-blur-sm"
            >
              <Link href={`/${type}/${item.id}`}>
                <Info className="w-4 h-4" /> More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
