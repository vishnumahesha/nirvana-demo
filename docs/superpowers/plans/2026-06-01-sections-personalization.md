# Sections + Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured Movies/TV landing pages, genre/discover browse pages, and personalized "For You" + "Because You Watched" rows backed by a `user_preferences` Supabase table with an onboarding modal.

**Architecture:** New TMDB fetch helpers extend `lib/tmdb.ts`; all browse pages are Server Components that read URL search params and call TMDB `/discover`; filter sidebars are Client Components that push URL param updates; personalization rows are async Server Components that compose watch_progress + TMDB recommendations; onboarding is a Client Component rendered conditionally on home.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind, @supabase/ssr, TMDB API (discover, genres, recommendations endpoints), Zod, lucide-react, Supabase MCP for migration.

---

## File Map

### New files
- `lib/tmdb.ts` — extend with: `getNowPlayingMovies`, `getUpcomingMovies`, `getAiringTodayTV`, `getOnTheAirTV`, `getMovieGenres`, `getTVGenres`, `discoverMedia`, `getRecommendations`
- `app/actions/preferences.ts` — server actions: `getPreferences`, `upsertPreferences`
- `app/movies/page.tsx` — movies landing
- `app/tv/page.tsx` — TV landing
- `app/movies/genre/[id]/page.tsx` — genre browse (movies)
- `app/tv/genre/[id]/page.tsx` — genre browse (TV)
- `app/discover/page.tsx` — advanced discover page
- `app/settings/page.tsx` — preferences editor
- `components/home/ForYouRow.tsx` — async Server Component, signed-in only
- `components/home/BecauseYouWatchedRow.tsx` — async Server Component, signed-in only
- `components/media/GenreChips.tsx` — genre chip grid (links)
- `components/filters/FilterBar.tsx` — client filter sidebar (URL params)
- `components/filters/FilterBarWrapper.tsx` — thin client wrapper for FilterBar on server pages
- `components/onboarding/OnboardingModal.tsx` — modal, shown when onboarded=false
- `components/onboarding/OnboardingTrigger.tsx` — client component that shows modal conditionally

### Modified files
- `components/nav/Nav.tsx` — add Home / Movies / TV links, Discover icon
- `components/home/Hero.tsx` — accept `type: 'movie' | 'tv' | 'all'` param
- `app/page.tsx` — slim home: ContinueWatching + ForYou + BecauseYouWatched + one TrendingRow

---

## Task 1: Supabase migration — user_preferences

**Files:**
- Apply via Supabase MCP

- [ ] **Step 1.1: Apply migration via MCP**

SQL to apply:
```sql
create table if not exists user_preferences (
  user_id uuid primary key references auth.users on delete cascade,
  preferred_genres int[] default '{}',
  preferred_media_type text default 'both'
    check (preferred_media_type in ('movies','tv','both')),
  onboarded boolean default false,
  updated_at timestamptz default now()
);
alter table user_preferences enable row level security;
create policy "own row" on user_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 1.2: Commit**
```bash
git commit -m "feat: add user_preferences table migration"
```

---

## Task 2: TMDB helpers

**Files:**
- Modify: `lib/tmdb.ts`

- [ ] **Step 2.1: Add GenreListSchema and new fetch functions**

Add to `lib/tmdb.ts`:
```typescript
export const GenreSchema2 = z.object({ id: z.number(), name: z.string() })
export const GenreListSchema = z.object({ genres: z.array(GenreSchema2) })
export type Genre = z.infer<typeof GenreSchema2>

const DiscoverResultSchema = z.object({
  results: z.array(MediaItemSchema),
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
})

export type DiscoverParams = {
  page?: number
  sort_by?: string
  with_genres?: string
  'primary_release_date.gte'?: string
  'primary_release_date.lte'?: string
  'first_air_date.gte'?: string
  'first_air_date.lte'?: string
  'with_runtime.gte'?: string
  'with_runtime.lte'?: string
}

export const getNowPlayingMovies = () => tmdbFetch(MediaListSchema, 'movie/now_playing')
export const getUpcomingMovies = () => tmdbFetch(MediaListSchema, 'movie/upcoming')
export const getAiringTodayTV = () => tmdbFetch(MediaListSchema, 'tv/airing_today')
export const getOnTheAirTV = () => tmdbFetch(MediaListSchema, 'tv/on_the_air')
export const getMovieGenres = () => tmdbFetch(GenreListSchema, 'genre/movie/list')
export const getTVGenres = () => tmdbFetch(GenreListSchema, 'genre/tv/list')
export const getRecommendations = (type: 'movie' | 'tv', id: number) =>
  tmdbFetch(MediaListSchema, `${type}/${id}/recommendations`)
export const discoverMedia = (type: 'movie' | 'tv', params: DiscoverParams = {}) =>
  tmdbFetch(DiscoverResultSchema, `discover/${type}`, Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)])
  ))
```

- [ ] **Step 2.2: Verify TypeScript**
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2.3: Commit**
```bash
git add lib/tmdb.ts
git commit -m "feat: add TMDB discover, genre, and recommendation helpers"
```

---

## Task 3: Update Nav

**Files:**
- Modify: `components/nav/Nav.tsx`

- [ ] **Step 3.1: Add Home / Movies / TV links and Discover icon**

Replace the `<header>` content — add nav links between logo and right-side controls:
```tsx
import { Compass } from 'lucide-react'

// Inside the flex row, after the logo:
<nav className="hidden md:flex items-center gap-6 text-sm">
  <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
  <Link href="/movies" className="text-gray-400 hover:text-white transition-colors">Movies</Link>
  <Link href="/tv" className="text-gray-400 hover:text-white transition-colors">TV</Link>
</nav>

// In the right-side icons row, before Search:
<Link href="/discover" className="text-gray-400 hover:text-white transition-colors">
  <Compass className="w-5 h-5" />
</Link>
```

- [ ] **Step 3.2: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 3.3: Commit**
```bash
git add components/nav/Nav.tsx
git commit -m "feat: add Home/Movies/TV nav links and Discover icon"
```

---

## Task 4: Hero accepts type param

**Files:**
- Modify: `components/home/Hero.tsx`

- [ ] **Step 4.1: Add type prop**

Change signature and fetch logic:
```tsx
export default async function Hero({ type = 'all' }: { type?: 'movie' | 'tv' | 'all' }) {
  const trending = await getTrending(type, 'week')
  // rest unchanged
}
```

- [ ] **Step 4.2: Commit**
```bash
git add components/home/Hero.tsx
git commit -m "feat: Hero accepts type param for movies/tv heroes"
```

---

## Task 5: /movies and /tv landing pages

**Files:**
- Create: `app/movies/page.tsx`
- Create: `app/tv/page.tsx`
- Create: `components/media/GenreChips.tsx`

- [ ] **Step 5.1: Create GenreChips component**

```tsx
// components/media/GenreChips.tsx
import Link from 'next/link'
import type { Genre } from '@/lib/tmdb'

type Props = {
  genres: Genre[]
  mediaType: 'movies' | 'tv'
}

export default function GenreChips({ genres, mediaType }: Props) {
  return (
    <section className="px-4 md:px-8 space-y-3">
      <h2 className="text-lg font-semibold text-white">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map(g => (
          <Link
            key={g.id}
            href={`/${mediaType}/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
            className="px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm text-gray-300 hover:text-white transition-colors"
          >
            {g.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5.2: Create /movies page**

```tsx
// app/movies/page.tsx
import { Suspense } from 'react'
import Hero from '@/components/home/Hero'
import MediaRow from '@/components/home/MediaRow'
import GenreChips from '@/components/media/GenreChips'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getPopularMovies, getTopRatedMovies,
  getNowPlayingMovies, getUpcomingMovies, getMovieGenres,
} from '@/lib/tmdb'

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

async function PopularRow() {
  const d = await getPopularMovies()
  return <MediaRow title="Popular" items={d.results} type="movie" />
}
async function TopRatedRow() {
  const d = await getTopRatedMovies()
  return <MediaRow title="Top Rated" items={d.results} type="movie" />
}
async function NowPlayingRow() {
  const d = await getNowPlayingMovies()
  return <MediaRow title="Now Playing" items={d.results} type="movie" />
}
async function UpcomingRow() {
  const d = await getUpcomingMovies()
  return <MediaRow title="Upcoming" items={d.results} type="movie" />
}
async function Genres() {
  const { genres } = await getMovieGenres()
  return <GenreChips genres={genres} mediaType="movies" />
}

export default function MoviesPage() {
  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<div className="h-[85vh] bg-zinc-900 animate-pulse" />}>
        <Hero type="movie" />
      </Suspense>
      <div className="relative z-10 -mt-16 space-y-10 pt-8">
        <Suspense fallback={<RowSkeleton />}><PopularRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><TopRatedRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><NowPlayingRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><UpcomingRow /></Suspense>
        <Suspense fallback={null}><Genres /></Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 5.3: Create /tv page**

```tsx
// app/tv/page.tsx
import { Suspense } from 'react'
import Hero from '@/components/home/Hero'
import MediaRow from '@/components/home/MediaRow'
import GenreChips from '@/components/media/GenreChips'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getPopularTV, getTopRatedTV,
  getAiringTodayTV, getOnTheAirTV, getTVGenres,
} from '@/lib/tmdb'

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

async function PopularRow() {
  const d = await getPopularTV()
  return <MediaRow title="Popular" items={d.results} type="tv" />
}
async function TopRatedRow() {
  const d = await getTopRatedTV()
  return <MediaRow title="Top Rated" items={d.results} type="tv" />
}
async function AiringTodayRow() {
  const d = await getAiringTodayTV()
  return <MediaRow title="Airing Today" items={d.results} type="tv" />
}
async function OnTheAirRow() {
  const d = await getOnTheAirTV()
  return <MediaRow title="On The Air" items={d.results} type="tv" />
}
async function Genres() {
  const { genres } = await getTVGenres()
  return <GenreChips genres={genres} mediaType="tv" />
}

export default function TVPage() {
  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<div className="h-[85vh] bg-zinc-900 animate-pulse" />}>
        <Hero type="tv" />
      </Suspense>
      <div className="relative z-10 -mt-16 space-y-10 pt-8">
        <Suspense fallback={<RowSkeleton />}><PopularRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><TopRatedRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><AiringTodayRow /></Suspense>
        <Suspense fallback={<RowSkeleton />}><OnTheAirRow /></Suspense>
        <Suspense fallback={null}><Genres /></Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 5.4: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 5.5: Commit**
```bash
git add app/movies/page.tsx app/tv/page.tsx components/media/GenreChips.tsx
git commit -m "feat: add /movies and /tv landing pages with genre chips"
```

---

## Task 6: Genre browse pages + filter sidebar

**Files:**
- Create: `components/filters/FilterBar.tsx`
- Create: `app/movies/genre/[id]/page.tsx`
- Create: `app/tv/genre/[id]/page.tsx`

- [ ] **Step 6.1: Create FilterBar client component**

```tsx
// components/filters/FilterBar.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

type Props = {
  showRuntime?: boolean
  currentSort: string
  currentYearMin: string
  currentYearMax: string
  currentRuntimeMin?: string
  currentRuntimeMax?: string
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => String(CURRENT_YEAR - i))

export default function FilterBar({
  showRuntime = false,
  currentSort,
  currentYearMin,
  currentYearMax,
  currentRuntimeMin = '0',
  currentRuntimeMax = '300',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, value)
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={currentSort} onValueChange={v => update('sort', v)}>
        <SelectTrigger className="w-44 bg-zinc-800 border-white/10 text-white">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/10 text-white">
          <SelectItem value="popularity.desc">Most Popular</SelectItem>
          <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
          <SelectItem value="primary_release_date.desc">Newest First</SelectItem>
          <SelectItem value="title.asc">Title A–Z</SelectItem>
        </SelectContent>
      </Select>

      <Select value={currentYearMin} onValueChange={v => update('year_min', v)}>
        <SelectTrigger className="w-32 bg-zinc-800 border-white/10 text-white">
          <SelectValue placeholder="From year" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-60 overflow-y-auto">
          {YEARS.reverse().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={currentYearMax} onValueChange={v => update('year_max', v)}>
        <SelectTrigger className="w-32 bg-zinc-800 border-white/10 text-white">
          <SelectValue placeholder="To year" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-60 overflow-y-auto">
          {[...YEARS].reverse().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>

      {showRuntime && (
        <>
          <Select value={currentRuntimeMin} onValueChange={v => update('runtime_min', v)}>
            <SelectTrigger className="w-36 bg-zinc-800 border-white/10 text-white">
              <SelectValue placeholder="Min runtime" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              {['0','60','90','120'].map(v => (
                <SelectItem key={v} value={v}>{v === '0' ? 'Any min' : `${v}+ min`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentRuntimeMax} onValueChange={v => update('runtime_max', v)}>
            <SelectTrigger className="w-36 bg-zinc-800 border-white/10 text-white">
              <SelectValue placeholder="Max runtime" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              {['60','90','120','180','300'].map(v => (
                <SelectItem key={v} value={v}>{v === '300' ? 'Any max' : `≤ ${v} min`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6.2: Create /movies/genre/[id] page**

```tsx
// app/movies/genre/[id]/page.tsx
import { Suspense } from 'react'
import { discoverMedia, getMovieGenres } from '@/lib/tmdb'
import MediaCard from '@/components/media/MediaCard'
import FilterBar from '@/components/filters/FilterBar'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    sort?: string; year_min?: string; year_max?: string
    runtime_min?: string; runtime_max?: string; page?: string; name?: string
  }>
}

export default async function MovieGenrePage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const genreId = Number(id)
  const sort = sp.sort ?? 'popularity.desc'
  const yearMin = sp.year_min ?? '1950'
  const yearMax = sp.year_max ?? String(new Date().getFullYear())
  const runtimeMin = sp.runtime_min ?? '0'
  const runtimeMax = sp.runtime_max ?? '300'
  const page = Number(sp.page ?? '1')
  const genreName = sp.name ?? 'Genre'

  const data = await discoverMedia('movie', {
    page,
    sort_by: sort,
    with_genres: String(genreId),
    'primary_release_date.gte': `${yearMin}-01-01`,
    'primary_release_date.lte': `${yearMax}-12-31`,
    'with_runtime.gte': runtimeMin !== '0' ? runtimeMin : undefined,
    'with_runtime.lte': runtimeMax !== '300' ? runtimeMax : undefined,
  })

  const totalPages = Math.min(data.total_pages, 500)
  const baseHref = `/movies/genre/${id}?sort=${sort}&year_min=${yearMin}&year_max=${yearMax}&runtime_min=${runtimeMin}&runtime_max=${runtimeMax}&name=${encodeURIComponent(genreName)}`

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{genreName} Movies</h1>
          <p className="text-gray-500 text-sm mt-1">{data.total_results.toLocaleString()} titles</p>
        </div>
        <Suspense fallback={null}>
          <FilterBar
            showRuntime
            currentSort={sort}
            currentYearMin={yearMin}
            currentYearMax={yearMax}
            currentRuntimeMin={runtimeMin}
            currentRuntimeMax={runtimeMax}
          />
        </Suspense>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {data.results.map(item => (
            <MediaCard key={item.id} item={item} type="movie" />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 pt-4">
          {page > 1 && (
            <Link href={`${baseHref}&page=${page - 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          )}
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`${baseHref}&page=${page + 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.3: Create /tv/genre/[id] page** (same pattern, TV-specific fields)

```tsx
// app/tv/genre/[id]/page.tsx
import { Suspense } from 'react'
import { discoverMedia } from '@/lib/tmdb'
import MediaCard from '@/components/media/MediaCard'
import FilterBar from '@/components/filters/FilterBar'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    sort?: string; year_min?: string; year_max?: string; page?: string; name?: string
  }>
}

export default async function TVGenrePage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const genreId = Number(id)
  const sort = sp.sort ?? 'popularity.desc'
  const yearMin = sp.year_min ?? '1950'
  const yearMax = sp.year_max ?? String(new Date().getFullYear())
  const page = Number(sp.page ?? '1')
  const genreName = sp.name ?? 'Genre'

  const data = await discoverMedia('tv', {
    page,
    sort_by: sort,
    with_genres: String(genreId),
    'first_air_date.gte': `${yearMin}-01-01`,
    'first_air_date.lte': `${yearMax}-12-31`,
  })

  const totalPages = Math.min(data.total_pages, 500)
  const baseHref = `/tv/genre/${id}?sort=${sort}&year_min=${yearMin}&year_max=${yearMax}&name=${encodeURIComponent(genreName)}`

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{genreName} TV Shows</h1>
          <p className="text-gray-500 text-sm mt-1">{data.total_results.toLocaleString()} titles</p>
        </div>
        <Suspense fallback={null}>
          <FilterBar
            currentSort={sort}
            currentYearMin={yearMin}
            currentYearMax={yearMax}
          />
        </Suspense>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {data.results.map(item => (
            <MediaCard key={item.id} item={item} type="tv" />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 pt-4">
          {page > 1 && (
            <Link href={`${baseHref}&page=${page - 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          )}
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`${baseHref}&page=${page + 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.4: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 6.5: Commit**
```bash
git add components/filters/ app/movies/genre/ app/tv/genre/
git commit -m "feat: add genre browse pages with filter bar"
```

---

## Task 7: /discover page

**Files:**
- Create: `app/discover/page.tsx`
- Create: `components/discover/DiscoverTabs.tsx` (client tab toggle)

- [ ] **Step 7.1: Create DiscoverTabs client component**

```tsx
// components/discover/DiscoverTabs.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function DiscoverTabs({ activeTab }: { activeTab: 'movie' | 'tv' }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setTab(tab: 'movie' | 'tv') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg w-fit">
      {(['movie', 'tv'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setTab(tab)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab
              ? 'bg-brand text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab === 'movie' ? 'Movies' : 'TV Shows'}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 7.2: Create /discover page**

```tsx
// app/discover/page.tsx
import { Suspense } from 'react'
import { discoverMedia, getMovieGenres, getTVGenres } from '@/lib/tmdb'
import MediaCard from '@/components/media/MediaCard'
import FilterBar from '@/components/filters/FilterBar'
import DiscoverTabs from '@/components/discover/DiscoverTabs'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  searchParams: Promise<{
    tab?: string; sort?: string; year_min?: string; year_max?: string
    runtime_min?: string; runtime_max?: string; genres?: string; page?: string
  }>
}

export default async function DiscoverPage({ searchParams }: Props) {
  const sp = await searchParams
  const tab = (sp.tab === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv'
  const sort = sp.sort ?? 'popularity.desc'
  const yearMin = sp.year_min ?? '1950'
  const yearMax = sp.year_max ?? String(new Date().getFullYear())
  const runtimeMin = sp.runtime_min ?? '0'
  const runtimeMax = sp.runtime_max ?? '300'
  const genreFilter = sp.genres ?? ''
  const page = Number(sp.page ?? '1')

  const [data, { genres: movieGenres }, { genres: tvGenres }] = await Promise.all([
    discoverMedia(tab, {
      page,
      sort_by: sort,
      with_genres: genreFilter || undefined,
      ...(tab === 'movie' ? {
        'primary_release_date.gte': `${yearMin}-01-01`,
        'primary_release_date.lte': `${yearMax}-12-31`,
        'with_runtime.gte': runtimeMin !== '0' ? runtimeMin : undefined,
        'with_runtime.lte': runtimeMax !== '300' ? runtimeMax : undefined,
      } : {
        'first_air_date.gte': `${yearMin}-01-01`,
        'first_air_date.lte': `${yearMax}-12-31`,
      }),
    }),
    getMovieGenres(),
    getTVGenres(),
  ])

  const genres = tab === 'movie' ? movieGenres : tvGenres
  const totalPages = Math.min(data.total_pages, 500)
  const baseHref = `/discover?tab=${tab}&sort=${sort}&year_min=${yearMin}&year_max=${yearMax}&runtime_min=${runtimeMin}&runtime_max=${runtimeMax}&genres=${genreFilter}`

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Discover</h1>
          <p className="text-gray-500 text-sm mt-1">{data.total_results.toLocaleString()} titles</p>
        </div>

        <Suspense fallback={null}>
          <DiscoverTabs activeTab={tab} />
        </Suspense>

        <div className="flex flex-wrap gap-2">
          {genres.map(g => {
            const selected = genreFilter.split(',').includes(String(g.id))
            const newGenres = selected
              ? genreFilter.split(',').filter(x => x !== String(g.id)).join(',')
              : genreFilter ? `${genreFilter},${g.id}` : String(g.id)
            const href = `/discover?tab=${tab}&sort=${sort}&year_min=${yearMin}&year_max=${yearMax}&runtime_min=${runtimeMin}&runtime_max=${runtimeMax}&genres=${newGenres}&page=1`
            return (
              <Link key={g.id} href={href}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selected
                    ? 'bg-brand text-white'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                }`}>
                {g.name}
              </Link>
            )
          })}
        </div>

        <Suspense fallback={null}>
          <FilterBar
            showRuntime={tab === 'movie'}
            currentSort={sort}
            currentYearMin={yearMin}
            currentYearMax={yearMax}
            currentRuntimeMin={runtimeMin}
            currentRuntimeMax={runtimeMax}
          />
        </Suspense>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {data.results.map(item => (
            <MediaCard key={item.id} item={item} type={tab} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          {page > 1 && (
            <Link href={`${baseHref}&page=${page - 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Link>
          )}
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`${baseHref}&page=${page + 1}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7.3: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 7.4: Commit**
```bash
git add app/discover/ components/discover/
git commit -m "feat: add /discover page with tab toggle and multi-genre filter"
```

---

## Task 8: Personalization server actions

**Files:**
- Create: `app/actions/preferences.ts`

- [ ] **Step 8.1: Create preferences server actions**

```typescript
// app/actions/preferences.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export type UserPreferences = {
  preferred_genres: number[]
  preferred_media_type: 'movies' | 'tv' | 'both'
  onboarded: boolean
}

export async function getPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('user_preferences')
    .select('preferred_genres, preferred_media_type, onboarded')
    .eq('user_id', user.id)
    .maybeSingle()
  return data as UserPreferences | null
}

export async function upsertPreferences(prefs: {
  preferred_genres: number[]
  preferred_media_type: 'movies' | 'tv' | 'both'
  onboarded: boolean
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase.from('user_preferences').upsert({
    user_id: user.id,
    ...prefs,
    updated_at: new Date().toISOString(),
  })
  return error ? { error: error.message } : {}
}
```

- [ ] **Step 8.2: Commit**
```bash
git add app/actions/preferences.ts
git commit -m "feat: add getPreferences and upsertPreferences server actions"
```

---

## Task 9: ForYou and BecauseYouWatched rows

**Files:**
- Create: `components/home/ForYouRow.tsx`
- Create: `components/home/BecauseYouWatchedRow.tsx`

- [ ] **Step 9.1: Create ForYouRow**

```tsx
// components/home/ForYouRow.tsx
import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/app/actions/preferences'
import { discoverMedia, getRecommendations } from '@/lib/tmdb'
import MediaRow from '@/components/home/MediaRow'
import type { MediaItem } from '@/lib/tmdb'

export default async function ForYouRow() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const prefs = await getPreferences()
  const preferredGenres = prefs?.preferred_genres ?? []

  const { data: recent } = await supabase
    .from('watch_progress')
    .select('tmdb_id, media_type, title')
    .eq('user_id', user.id)
    .gte('progress', 0.2)
    .order('updated_at', { ascending: false })
    .limit(3)

  let candidates: MediaItem[] = []

  if (recent && recent.length > 0) {
    const recResults = await Promise.allSettled(
      recent.map(r => getRecommendations(r.media_type as 'movie' | 'tv', r.tmdb_id))
    )
    const seen = new Set<number>()
    const allRecs: MediaItem[] = []
    for (const r of recResults) {
      if (r.status === 'fulfilled') {
        for (const item of r.value.results) {
          if (!seen.has(item.id)) { seen.add(item.id); allRecs.push(item) }
        }
      }
    }
    if (preferredGenres.length > 0) {
      candidates = allRecs.sort(() => Math.random() - 0.5).slice(0, 20)
    } else {
      candidates = allRecs.slice(0, 20)
    }
  } else if (preferredGenres.length > 0) {
    const mediaType = prefs?.preferred_media_type === 'tv' ? 'tv' : 'movie'
    const data = await discoverMedia(mediaType, {
      with_genres: preferredGenres.slice(0, 3).join(','),
      sort_by: 'popularity.desc',
    })
    candidates = data.results.slice(0, 20)
  }

  if (candidates.length === 0) return null

  const subtitle = recent && recent.length > 0
    ? 'Based on what you\'ve watched'
    : 'Based on your taste'

  return (
    <section className="px-4 md:px-8 space-y-1">
      <h2 className="text-lg font-semibold text-white">For You</h2>
      <p className="text-xs text-gray-500 pb-2">{subtitle}</p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
        {candidates.map(item => {
          const type = (item.media_type === 'movie' ? 'movie' : 'tv') as 'movie' | 'tv'
          const { default: MediaCard } = require('@/components/media/MediaCard')
          return null // handled below
        })}
      </div>
    </section>
  )
}
```

Actually, ForYouRow should use MediaRow directly:

```tsx
// components/home/ForYouRow.tsx
import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/app/actions/preferences'
import { discoverMedia, getRecommendations } from '@/lib/tmdb'
import MediaCard from '@/components/media/MediaCard'
import type { MediaItem } from '@/lib/tmdb'

export default async function ForYouRow() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const prefs = await getPreferences()
  const preferredGenres = prefs?.preferred_genres ?? []

  const { data: recent } = await supabase
    .from('watch_progress')
    .select('tmdb_id, media_type')
    .eq('user_id', user.id)
    .gte('progress', 0.2)
    .order('updated_at', { ascending: false })
    .limit(3)

  let candidates: (MediaItem & { resolvedType: 'movie' | 'tv' })[] = []

  if (recent && recent.length > 0) {
    const recResults = await Promise.allSettled(
      recent.map(r => getRecommendations(r.media_type as 'movie' | 'tv', r.tmdb_id)
        .then(d => d.results.map(item => ({ ...item, resolvedType: r.media_type as 'movie' | 'tv' })))
      )
    )
    const seen = new Set<number>()
    for (const r of recResults) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          if (!seen.has(item.id)) { seen.add(item.id); candidates.push(item) }
        }
      }
    }
    candidates = candidates.slice(0, 20)
  } else if (preferredGenres.length > 0) {
    const mediaType = prefs?.preferred_media_type === 'tv' ? 'tv' : 'movie'
    const data = await discoverMedia(mediaType, {
      with_genres: preferredGenres.slice(0, 3).join(','),
      sort_by: 'popularity.desc',
    })
    candidates = data.results.map(item => ({ ...item, resolvedType: mediaType }))
  }

  if (candidates.length === 0) return null

  const subtitle = recent && recent.length > 0
    ? "Based on what you've watched"
    : 'Based on your taste'

  return (
    <section className="px-4 md:px-8 space-y-1">
      <h2 className="text-lg font-semibold text-white">For You</h2>
      <p className="text-xs text-gray-500 pb-2">{subtitle}</p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
        {candidates.map(item => (
          <MediaCard key={item.id} item={item} type={item.resolvedType} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 9.2: Create BecauseYouWatchedRow**

```tsx
// components/home/BecauseYouWatchedRow.tsx
import { createClient } from '@/lib/supabase/server'
import { getRecommendations } from '@/lib/tmdb'
import MediaCard from '@/components/media/MediaCard'

export default async function BecauseYouWatchedRows() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: recent } = await supabase
    .from('watch_progress')
    .select('tmdb_id, media_type, title')
    .eq('user_id', user.id)
    .gte('progress', 0.2)
    .order('updated_at', { ascending: false })
    .limit(2)

  if (!recent || recent.length === 0) return null

  const rows = await Promise.allSettled(
    recent.map(async r => {
      const data = await getRecommendations(r.media_type as 'movie' | 'tv', r.tmdb_id)
      return { title: r.title, mediaType: r.media_type as 'movie' | 'tv', items: data.results.slice(0, 20) }
    })
  )

  return (
    <>
      {rows.map((r, i) => {
        if (r.status !== 'fulfilled' || r.value.items.length === 0) return null
        const { title, mediaType, items } = r.value
        return (
          <section key={i} className="px-4 md:px-8 space-y-3">
            <h2 className="text-lg font-semibold text-white">Because you watched <span className="text-brand">{title}</span></h2>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none">
              {items.map(item => (
                <MediaCard key={item.id} item={item} type={mediaType} />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
```

- [ ] **Step 9.3: Commit**
```bash
git add components/home/ForYouRow.tsx components/home/BecauseYouWatchedRow.tsx
git commit -m "feat: add ForYou and BecauseYouWatched personalization rows"
```

---

## Task 10: Slim home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 10.1: Update home page**

```tsx
// app/page.tsx
import { Suspense } from 'react'
import Hero from '@/components/home/Hero'
import MediaRow from '@/components/home/MediaRow'
import ContinueWatching from '@/components/home/ContinueWatching'
import ForYouRow from '@/components/home/ForYouRow'
import BecauseYouWatchedRows from '@/components/home/BecauseYouWatchedRow'
import { Skeleton } from '@/components/ui/skeleton'
import { getTrending } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'

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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
        {user && (
          <Suspense fallback={<RowSkeleton />}>
            <ForYouRow />
          </Suspense>
        )}
        {user && (
          <Suspense fallback={null}>
            <BecauseYouWatchedRows />
          </Suspense>
        )}
        <Suspense fallback={<RowSkeleton />}><TrendingRow /></Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 10.2: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 10.3: Commit**
```bash
git add app/page.tsx
git commit -m "feat: slim home page with personalized rows"
```

---

## Task 11: Onboarding modal

**Files:**
- Create: `components/onboarding/OnboardingModal.tsx`
- Create: `components/onboarding/OnboardingTrigger.tsx`
- Modify: `app/page.tsx` — render OnboardingTrigger for signed-in users

- [ ] **Step 11.1: Create OnboardingModal**

```tsx
// components/onboarding/OnboardingModal.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertPreferences } from '@/app/actions/preferences'
import { Button } from '@/components/ui/button'

const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
]

type MediaType = 'movies' | 'tv' | 'both'

export default function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [mediaType, setMediaType] = useState<MediaType>('both')
  const [genres, setGenres] = useState<number[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggleGenre(id: number) {
    setGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function submit(skip = false) {
    startTransition(async () => {
      await upsertPreferences({
        preferred_media_type: mediaType,
        preferred_genres: skip ? [] : genres,
        onboarded: true,
      })
      onDone()
      router.refresh()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-8 space-y-6">
        {step === 1 ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-white">What do you watch?</h2>
              <p className="text-gray-400 text-sm mt-1">We'll personalize your home page.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['movies', 'tv', 'both'] as MediaType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setMediaType(t)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    mediaType === t
                      ? 'bg-brand text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  {t === 'movies' ? 'Movies' : t === 'tv' ? 'TV Shows' : 'Both'}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="bg-brand hover:bg-brand/90 text-white">
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold text-white">Pick your favorite genres</h2>
              <p className="text-gray-400 text-sm mt-1">Choose 3–5 to get better recommendations.</p>
            </div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {MOVIE_GENRES.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    genres.includes(g.id)
                      ? 'bg-brand text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => submit(true)}
                disabled={isPending}
                className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                Skip for now
              </button>
              <Button
                onClick={() => submit(false)}
                disabled={isPending || genres.length < 1}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                {isPending ? 'Saving...' : 'Done'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 11.2: Create OnboardingTrigger**

```tsx
// components/onboarding/OnboardingTrigger.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const OnboardingModal = dynamic(() => import('./OnboardingModal'))

export default function OnboardingTrigger({ shouldShow }: { shouldShow: boolean }) {
  const [visible, setVisible] = useState(shouldShow)
  if (!visible) return null
  return <OnboardingModal onDone={() => setVisible(false)} />
}
```

- [ ] **Step 11.3: Add OnboardingTrigger to home page**

In `app/page.tsx`, after the user check, add:
```tsx
import { getPreferences } from '@/app/actions/preferences'
import OnboardingTrigger from '@/components/onboarding/OnboardingTrigger'

// Inside HomePage, after user check:
const prefs = user ? await getPreferences() : null
const showOnboarding = !!user && (prefs === null || prefs.onboarded === false)

// Render inside <main> at the top:
{user && <OnboardingTrigger shouldShow={showOnboarding} />}
```

- [ ] **Step 11.4: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 11.5: Commit**
```bash
git add components/onboarding/ app/page.tsx
git commit -m "feat: add onboarding modal for first-time signed-in users"
```

---

## Task 12: /settings page

**Files:**
- Create: `app/settings/page.tsx`

- [ ] **Step 12.1: Create settings page**

```tsx
// app/settings/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPreferences } from '@/app/actions/preferences'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const prefs = await getPreferences()

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white">Preferences</h1>
        <SettingsForm initialPrefs={prefs} />
      </div>
    </div>
  )
}
```

- [ ] **Step 12.2: Create SettingsForm client component**

```tsx
// app/settings/SettingsForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertPreferences, type UserPreferences } from '@/app/actions/preferences'
import { Button } from '@/components/ui/button'

const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
]

type MediaType = 'movies' | 'tv' | 'both'

export default function SettingsForm({ initialPrefs }: { initialPrefs: UserPreferences | null }) {
  const [mediaType, setMediaType] = useState<MediaType>(
    (initialPrefs?.preferred_media_type as MediaType) ?? 'both'
  )
  const [genres, setGenres] = useState<number[]>(initialPrefs?.preferred_genres ?? [])
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggleGenre(id: number) {
    setGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function save() {
    startTransition(async () => {
      await upsertPreferences({ preferred_media_type: mediaType, preferred_genres: genres, onboarded: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">What do you watch?</label>
        <div className="flex gap-3">
          {(['movies', 'tv', 'both'] as MediaType[]).map(t => (
            <button key={t} onClick={() => setMediaType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mediaType === t ? 'bg-brand text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {t === 'movies' ? 'Movies' : t === 'tv' ? 'TV Shows' : 'Both'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Favorite genres</label>
        <div className="flex flex-wrap gap-2">
          {MOVIE_GENRES.map(g => (
            <button key={g.id} onClick={() => toggleGenre(g.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                genres.includes(g.id) ? 'bg-brand text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={isPending} className="bg-brand hover:bg-brand/90 text-white">
        {isPending ? 'Saving...' : saved ? 'Saved!' : 'Save preferences'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 12.3: Add Settings link to Nav dropdown**

In `components/nav/Nav.tsx`, add a Settings item to the user dropdown:
```tsx
import { Settings } from 'lucide-react'

// In the dropdown:
<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
  <Link href="/settings" className="flex items-center gap-2 w-full">
    <Settings className="w-4 h-4" /> Settings
  </Link>
</DropdownMenuItem>
```

- [ ] **Step 12.4: Verify TypeScript**
```bash
npx tsc --noEmit
```

- [ ] **Step 12.5: Commit and push**
```bash
git add app/settings/ components/nav/Nav.tsx
git commit -m "feat: add /settings page for preferences editing"
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ `/movies` landing — hero, Popular, Top Rated, Now Playing, Upcoming, Browse by Genre
- ✅ `/tv` landing — hero, Popular, Top Rated, Airing Today, On The Air, Browse by Genre  
- ✅ `/movies/genre/[id]` — filter bar, paginated grid
- ✅ `/tv/genre/[id]` — filter bar, paginated grid
- ✅ `/discover` — tab toggle, multi-genre chips, filter bar, paginated grid
- ✅ Nav: Home / Movies / TV / Discover icon / Search
- ✅ `user_preferences` table with migration
- ✅ Onboarding modal (3 steps: media type, genres, skip)
- ✅ For You row — watch history → recommendations → genre scoring
- ✅ Because You Watched rows — last 2 watched items
- ✅ `/settings` page
- ✅ Supabase MCP migration

**Gaps found:** None — all spec sections covered.
