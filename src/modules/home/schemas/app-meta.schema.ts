import { z } from 'zod'

const appMetaSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
})

export type AppMeta = z.infer<typeof appMetaSchema>

export const appMeta: AppMeta = appMetaSchema.parse({
  title: 'Frontend starter is ready',
  tagline: 'Build your challenge features under src/modules/.',
})
