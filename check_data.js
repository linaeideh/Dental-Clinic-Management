
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brwhijlnrxejssacydhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2hpamxucnhlanNzYWN5ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjAyMjMsImV4cCI6MjA4MTAzNjIyM30.sOv8sGIyqHb8-xPEBLT4LxOp8s44euj1DDZyIjpprfw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Fetching appointments...');
  const { data, error } = await supabase.from('appointments').select('*');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Count:', data.length);
    if (data.length > 0) {
        console.log('First row doctor_id:', data[0].doctor_id);
    }
    console.log('First 2 rows:', JSON.stringify(data.slice(0, 2), null, 2));
  }
}

checkData();
