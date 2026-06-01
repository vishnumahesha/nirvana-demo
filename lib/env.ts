import { z } from 'zod'

const schema = z.object({
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
})

export const serverEnv = schema.parse({
  TMDB_API_KEY: process.env.TMDB_API_KEY,
})
