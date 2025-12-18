
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '2pahgjjk', 
  dataset: 'production', 
  apiVersion: '2025-12-16',
  useCdn: false 
})

async function checkData() {
  try {
    console.log('Fetching documents...')
    const data = await client.fetch('*[_type == "procedure"]')
    console.log('Success! Documents found:', data.length)
    if (data.length > 0) {
      console.log('First document:', data[0].title)
    } else {
      console.log('No documents found with type "procedure". Check your schema name or if you published them.')
    }
  } catch (err) {
    console.error('Error connecting to Sanity:', err.message)
  }
}

checkData()
