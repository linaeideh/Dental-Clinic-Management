
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '2pahgjjk',
  dataset: 'production',
  apiVersion: '2025-12-16',
  useCdn: false
});

async function testFetch() {
  try {
    console.log("Fetching procedures...");
    const query = '*[_type == "procedure"]';
    const data = await client.fetch(query);
    console.log("Data received:", JSON.stringify(data, null, 2));
    console.log("Count:", data.length);
  } catch (error) {
    console.error("Error fetching:", error);
  }
}

testFetch();
