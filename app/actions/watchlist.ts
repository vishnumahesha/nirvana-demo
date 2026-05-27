'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWatchlist({
  mediaType,
  tmdbId,
  title,
  posterPath,
  inWatchlist,
  path,
}: {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  title: string
  posterPath: string | null
  inWatchlist: boolean
  path: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (inWatchlist) {
    await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('media_type', mediaType)
      .eq('tmdb_id', tmdbId)
  } else {
    await supabase.from('watchlist').insert({
      user_id: user.id,
      media_type: mediaType,
      tmdb_id: tmdbId,
      title,
      poster_path: posterPath,
    })
  }

  revalidatePath(path)
  return { ok: true }
}
