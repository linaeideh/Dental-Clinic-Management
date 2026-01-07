
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brwhijlnrxejssacydhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2hpamxucnhlanNzYWN5ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjAyMjMsImV4cCI6MjA4MTAzNjIyM30.sOv8sGIyqHb8-xPEBLT4LxOp8s44euj1DDZyIjpprfw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctors() {
  console.log('Fetching doctors...');
  const { data, error } = await supabase.from('doctors').select('*');
  
  if (error) {
    console.error('Error fetching doctors:', error);
    // Fallback: fetch distinct doctor_ids from appointments
    console.log('Fetching distinct doctor_ids from appointments...');
    const { data: apts, error: aptError } = await supabase.from('appointments').select('doctor_id');
    if (aptError) console.error(aptError);
    else {
        const ids = [...new Set(apts.map(a => a.doctor_id))];
        console.log('Found doctor IDs in appointments:', ids);
    }
  } else {
    console.log('Doctors count:', data.length);
    console.log('Doctors:', JSON.stringify(data, null, 2));
  }
}

checkDoctors();
