import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '2pahgjjk',
  dataset: 'production',
  apiVersion: '2025-12-16',
  useCdn: false,
  perspective: 'published',
});

async function check() {
  try {
    console.log('Fetching doctors...');
    const doctors = await client.fetch('*[_type == "doctor"]');
    console.log('Doctors found:', doctors.length);
    console.log(doctors);

    console.log('Fetching procedures...');
    const procedures = await client.fetch('*[_type == "procedure"]');
    console.log('Procedures found:', procedures.length);
    console.log(procedures);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

check();
