import MediaCard from '@/components/media/MediaCard'
import type { MediaItem } from '@/lib/tmdb'

type Props = {
  title: string
  items: MediaItem[]
  type?: 'movie' | 'tv'
}

export default function MediaRow({ title, items, type }: Props) {
  return (
    <section className="px-4 md:px-8 space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
        {items.map(item => {
          const mediaType = (type ?? (item.media_type === 'movie' ? 'movie' : 'tv')) as 'movie' | 'tv'
          return <MediaCard key={item.id} item={item} type={mediaType} />
        })}
      </div>
    </section>
  )
}
