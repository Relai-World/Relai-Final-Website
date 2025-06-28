import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file for SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Test the connection
supabase.from('document_metadata').select('count').limit(1)
  .then(() => {
    console.log('✅ Successfully connected to Supabase');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to Supabase:', error.message);
    throw new Error('Failed to connect to Supabase. Please check your credentials and network connection.');
  }); 