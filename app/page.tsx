import { Suspense } from 'react'
import Hero from '@/components/home/Hero'
import MediaRow from '@/components/home/MediaRow'
import ContinueWatching from '@/components/home/ContinueWatching'
import { Skeleton } from '@/components/ui/skeleton'
import { getTrending, getPopularMovies, getPopularTV, getTopRatedMovies } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'

async function TrendingRow() {
  const data = await getTrending()
  return <MediaRow title="Trending This Week" items={data.results} />
}
async function PopularMoviesRow() {
  const data = await getPopularMovies()
  return <MediaRow title="Popular Movies" items={data.results} type="movie" />
}
async function PopularTVRow() {
  const data = await getPopularTV()
  return <MediaRow title="Popular TV" items={data.results} type="tv" />
}
async function TopRatedRow() {
  const data = await getTopRatedMovies()
  return <MediaRow title="Top Rated" items={data.results} type="movie" />
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

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<div className="h-[85vh] bg-zinc-900 animate-pulse" />}>
        <Hero />
      </Suspense>
      <div className="relative z-10 -mt-16 space-y-10 pt-8">
        {user && (
          <Suspense fallback={null}>
            <ContinueWatching />
          </Suspense>
        )}
        <Suspense fallback={<RowSkeleton />}><TrendingRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><PopularMoviesRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><PopularTVRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><TopRatedRow /></Suspense>
      </div>
    </main>
  )
}
