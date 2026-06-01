import { Suspense } from 'react'
import Hero from '@/components/home/Hero'
import MediaRow from '@/components/home/MediaRow'
import ContinueWatching from '@/components/home/ContinueWatching'
import { Skeleton } from '@/components/ui/skeleton'
import { getTrending } from '@/lib/tmdb'

async function TrendingRow() {
  const data = await getTrending()
  return <MediaRow title="Trending This Week" items={data.results} />
}

function RowSkeleton() {
  return (
    <div className="px-4 md:px-8 space-y-3">
      <Skeleton className="h-6 w-48 bg-zinc-800" />
      <div className="flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="flex-none w-36 md:w-44 aspect-[2/3] rounded-md bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<div className="h-[85vh] bg-zinc-900 animate-pulse" />}>
        <Hero />
      </Suspense>
      <div className="relative z-10 -mt-16 space-y-10 pt-8">
        <ContinueWatching />
        <Suspense fallback={<RowSkeleton />}><TrendingRow /></Suspense>
      </div>
    </main>
  )
}
