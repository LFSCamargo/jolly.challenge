import { z } from 'zod'

const showImageSchema = z
  .object({
    medium: z.string().url().nullable().optional(),
    original: z.string().url().nullable().optional(),
  })
  .nullable()
  .optional()

export const showSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  status: z.string(),
  image: showImageSchema,
  summary: z.string().nullable().optional(),
  genres: z.array(z.string()).optional(),
  rating: z
    .object({
      average: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
})

export type Show = z.infer<typeof showSchema>

const searchResultSchema = z.object({
  score: z.number(),
  show: showSchema,
})

export const searchResultsSchema = z.array(searchResultSchema)

export const showsPageSchema = z.array(showSchema)

const episodeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  season: z.number().int(),
  number: z.number().nullable(),
  airdate: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  summary: z.string().nullable().optional(),
})

export type Episode = z.infer<typeof episodeSchema>

export const episodesSchema = z.array(episodeSchema)
