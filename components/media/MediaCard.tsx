import Link from 'next/link'
import Image from 'next/image'
import type { MediaItem } from '@/lib/tmdb'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

type Props = {
  item: MediaItem
  type: 'movie' | 'tv'
}

export default function MediaCard({ item, type }: Props) {
  const title = item.title ?? item.name ?? 'Unknown'
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)

  return (
    <Link href={`/${type}/${item.id}`} className="snap-start flex-none w-36 md:w-44 group">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800">
        {item.poster_path ? (
          <Image
            src={`${TMDB_IMAGE_BASE}/w342${item.poster_path}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 144px, 176px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">
            No image
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/70 text-white text-xs gap-1 flex items-center border-0 px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>
      <div className="mt-1.5 px-0.5 space-y-0.5">
        <p className="text-sm text-white leading-tight truncate">{title}</p>
        {year && <p className="text-xs text-gray-500">{year}</p>}
      </div>
    </Link>
  )
}
