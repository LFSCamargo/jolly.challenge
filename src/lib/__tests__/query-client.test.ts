import { describe, expect, it } from 'vitest'
import { createAppQueryClient, QUERY_STALE_TIME_MS } from '../query-client'

describe('createAppQueryClient', () => {
  it('keeps TVMaze responses fresh for one minute before refetching', () => {
    const client = createAppQueryClient()

    expect(QUERY_STALE_TIME_MS).toBe(60_000)
    expect(client.getDefaultOptions().queries?.staleTime).toBe(60_000)
  })
})
