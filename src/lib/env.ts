const apiKey = import.meta.env.API_KEY ?? import.meta.env.VITE_API_KEY ?? ''

export const env = {
  tvmazeBaseUrl: 'https://api.tvmaze.com',
  apiKey: typeof apiKey === 'string' ? apiKey : '',
} as const
