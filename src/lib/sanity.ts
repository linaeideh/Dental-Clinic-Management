import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: '2pahgjjk',
  dataset: 'production',
  apiVersion: '2025-12-16',
  useCdn: true, // Use CDN for production/SSG
})

// Helper for fetching data on the server
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: Record<string, unknown>
  tags?: string[]
}) {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      revalidate: 3600, // Revalidate every hour by default
      tags,
    },
  })
}
