import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables in various environments (Vite, Next.js, etc.)
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
  }
  return '';
};

// Use provided credentials as default if env vars are missing
const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://brwhijlnrxejssacydhy.supabase.co';
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2hpamxucnhlanNzYWN5ZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjAyMjMsImV4cCI6MjA4MTAzNjIyM30.sOv8sGIyqHb8-xPEBLT4LxOp8s44euj1DDZyIjpprfw';

export const supabase = createClient(supabaseUrl, supabaseKey);