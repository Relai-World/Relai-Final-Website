import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variables for Supabase connection with fallback to hardcoded values
const supabaseUrl = process.env.SUPABASE_URL || 'https://sshlgndtfgcetserjfow.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGxnbmR0ZmdjZXRzZXJqZm93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwOTkzNiwiZXhwIjoyMDYzNDg1OTM2fQ.JgQPgcUhWcIP5NQfXDBGAJbiiJ4ulbhkNhQ5b6t-lG8';

// Validate Supabase credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your environment variables.');
  console.error('Expected: SUPABASE_URL and SUPABASE_KEY');
}

// Create and export Supabase client with consistent configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
});

// Test connection function
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('document_metadata').select('count').limit(1);
    console.log('✅ Supabase connection successful');
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown connection error';
    console.error('❌ Supabase connection failed:', errorMessage);
    
    // Check for specific error types
    if (error.code === 'ENOTFOUND' || errorMessage.includes('getaddrinfo ENOTFOUND')) {
      return { 
        success: false, 
        error: 'DNS resolution failed. Please check your SUPABASE_URL and ensure the Supabase project is active.' 
      };
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return { 
        success: false, 
        error: 'Authentication failed. Please check your SUPABASE_KEY.' 
      };
    }
    
    return { 
      success: false, 
      error: `Connection failed: ${errorMessage}` 
    };
  }
}

// Helper function to handle database errors consistently
export function handleDatabaseError(error: any): { status: number; error: string; details: string; suggestion?: string } {
  console.error('Database error:', error);
  
  if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo ENOTFOUND')) {
    return {
      status: 503,
      error: 'Database connection failed',
      details: 'Unable to resolve database hostname. Please check your Supabase URL.',
      suggestion: 'Verify your SUPABASE_URL environment variable is correct and the Supabase project is active.'
    };
  }
  
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    return {
      status: 401,
      error: 'Authentication failed',
      details: 'Invalid or expired Supabase credentials.',
      suggestion: 'Check your SUPABASE_KEY environment variable.'
    };
  }
  
  if (error.message?.includes('404') || error.message?.includes('Not Found')) {
    return {
      status: 404,
      error: 'Resource not found',
      details: error.message
    };
  }
  
  return {
    status: 500,
    error: 'Database operation failed',
    details: error.message || 'Unknown database error'
  };
}

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT_SET',
  hasCredentials: !!(supabaseUrl && supabaseKey)
}; 