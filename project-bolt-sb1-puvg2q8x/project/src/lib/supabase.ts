import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials
const SUPABASE_URL = 'https://uzwpbrlbblbkvxxoanym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d3BicmxiYmxia3Z4eG9hbnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjIyMjEsImV4cCI6MjA1NzA5ODIyMX0.EuP-m55jqwUxnvstWmShIVCCoS_VEEajnG17gfnUXog';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connection successful');
  }
});

export default supabase;