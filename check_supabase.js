
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brwhijlnrxejssacydhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2hpamxucnhlanNzYWN5ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjAyMjMsImV4cCI6MjA4MTAzNjIyM30.sOv8sGIyqHb8-xPEBLT4LxOp8s44euj1DDZyIjpprfw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error connecting:', error);
    } else {
      console.log('Connection successful!');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

check();
