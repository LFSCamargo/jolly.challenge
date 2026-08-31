export const mockShow = {
  id: 1,
  name: 'Mock Show',
  status: 'Running',
  image: {
    medium: 'https://example.com/medium.jpg',
    original: 'https://example.com/original.jpg',
  },
  summary: '<p>A mock summary.</p>',
  genres: ['Drama'],
  rating: { average: 8.2 },
}

export const mockEndedShow = {
  id: 2,
  name: 'Ended Show',
  status: 'Ended',
  image: null,
}

export const mockSearchPayload = [{ score: 0.9, show: mockShow }]

export const mockEpisodes = [
  {
    id: 10,
    name: 'Pilot',
    season: 1,
    number: 1,
    airdate: '2020-01-01',
    runtime: 45,
    summary: '<p>First episode.</p>',
  },
  {
    id: 11,
    name: 'Second',
    season: 1,
    number: 2,
    airdate: '2020-01-08',
    runtime: 45,
    summary: null,
  },
  {
    id: 12,
    name: 'Season Two Premiere',
    season: 2,
    number: 1,
    airdate: '2021-01-01',
    runtime: 45,
    summary: null,
  },
]
