#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Regenerates test-fixtures/tvmaze.mock-data.ts from live TVMaze responses.
 * Run: node scripts/generate-tvmaze-mock-data.mjs
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'test-fixtures/tvmaze.mock-data.ts')

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`)
  }

  return response.json()
}

async function main() {
  const [
    browsePage0,
    browsePage1,
    browsePage2,
    searchBreaking,
    searchGirls,
    searchEmpty,
    show169,
    episodes169,
    episodes1,
  ] = await Promise.all([
    fetchJson('https://api.tvmaze.com/shows?page=0'),
    fetchJson('https://api.tvmaze.com/shows?page=1'),
    fetchJson('https://api.tvmaze.com/shows?page=2'),
    fetchJson('https://api.tvmaze.com/search/shows?q=breaking'),
    fetchJson('https://api.tvmaze.com/search/shows?q=girls'),
    fetchJson('https://api.tvmaze.com/search/shows?q=zzzzno-match-xyz'),
    fetchJson('https://api.tvmaze.com/shows/169'),
    fetchJson('https://api.tvmaze.com/shows/169/episodes'),
    fetchJson('https://api.tvmaze.com/shows/1/episodes'),
  ])

  const show1 = browsePage0.find((show) => show.id === 1) ?? browsePage0[0]

  const payload = {
    browsePages: {
      0: browsePage0,
      1: browsePage1,
      2: browsePage2,
    },
    search: {
      breaking: searchBreaking,
      girls: searchGirls,
      empty: searchEmpty,
    },
    shows: {
      1: show1,
      169: show169,
    },
    episodes: {
      1: episodes1,
      169: episodes169,
    },
  }

  const featuredShow = browsePage0[0]
  const runningShow = browsePage0.find((show) => show.status === 'Running')
  const endedShow = browsePage0.find(
    (show) => show.status === 'Ended' && show.id !== featuredShow.id,
  )

  const header = `/**
 * TVMaze mock data captured from real API responses.
 * Used in Vitest and Playwright only — never loaded in dev or production.
 *
 * Regenerate: node scripts/generate-tvmaze-mock-data.mjs
 */

export const tvmazeMockData = ${JSON.stringify(payload, null, 2)} as const

export const tvmazeTestLabels = {
  featuredShowId: ${featuredShow.id},
  featuredShowName: ${JSON.stringify(featuredShow.name)},
  runningShowId: ${runningShow?.id ?? featuredShow.id},
  runningShowName: ${JSON.stringify(runningShow?.name ?? featuredShow.name)},
  endedShowId: ${endedShow?.id ?? featuredShow.id},
  endedShowName: ${JSON.stringify(endedShow?.name ?? featuredShow.name)},
  detailShowId: 169,
  detailShowName: ${JSON.stringify(show169.name)},
  searchQuery: 'breaking',
  searchTopResultName: ${JSON.stringify(searchBreaking[0]?.show.name ?? 'Breaking Bad')},
  browsePageCount: 3,
  browsePageSize: ${browsePage0.length},
} as const
`

  writeFileSync(OUT, header, 'utf8')
  console.log(`Wrote ${OUT} (${(header.length / 1024 / 1024).toFixed(2)} MB)`)
}

void main()
