import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const BodySchema = z.object({
  media_type: z.enum(['movie', 'tv']),
  tmdb_id: z.number().int().positive(),
  season: z.number().int().nullable(),
  episode: z.number().int().nullable(),
  current_time_s: z.number().min(0),
  duration_s: z.number().positive(),
  progress: z.number().min(0).max(1),
  title: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  episode_title: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  const parsed = BodySchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const d = parsed.data

  // Manual upsert: coalesce-based unique constraint can't use onConflict columns directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase
    .from('watch_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('media_type', d.media_type)
    .eq('tmdb_id', d.tmdb_id)

  q = d.season != null ? q.eq('season', d.season) : q.is('season', null)
  q = d.episode != null ? q.eq('episode', d.episode) : q.is('episode', null)

  const { data: existing } = await q.maybeSingle()

  const row = {
    user_id: user.id,
    media_type: d.media_type,
    tmdb_id: d.tmdb_id,
    season: d.season,
    episode: d.episode,
    current_time_s: d.current_time_s,
    duration_s: d.duration_s,
    progress: d.progress,
    title: d.title ?? null,
    poster_path: d.poster_path ?? null,
    backdrop_path: d.backdrop_path ?? null,
    episode_title: d.episode_title ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = existing
    ? await supabase.from('watch_progress').update(row).eq('id', existing.id)
    : await supabase.from('watch_progress').insert(row)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
