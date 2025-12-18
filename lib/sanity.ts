import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: '2pahgjjk', // نفس المشروع الموجود عندك
  dataset: 'production',
  apiVersion: '2025-12-16', 
  useCdn: false, // Update based on preference, false helps with fresh data during dev
  perspective: 'published',
  ignoreBrowserTokenWarning: true
})
