import { createClient } from '@supabase/supabase-js'

// Fixed Supabase URL from the user's provided code
const supabaseUrl = 'https://mxkwcjsdbljjkwqvdgks.supabase.co'

// Get the key from environment variables
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14a3djanNkYmxqamt3cXZkZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDE3OTMsImV4cCI6MjA2MTUxNzc5M30.gLI4daMU7B_5Wmi7Cbff7XqfLMFd6omZIPLrp72kzDM'

// Log the configuration for debugging
console.log('Initializing Supabase client with URL:', supabaseUrl)

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'nexus-website-builder',
    },
  },
})

// Test function to verify Edge Functions availability
export async function verifyEdgeFunctionsAvailability() {
  try {
    // Check if the deploy-site function is available by trying to access it
    // Instead of listing functions (which may not be available in all plans),
    // we'll just check if the invoke method exists
    if (typeof supabase.functions.invoke !== 'function') {
      console.error('Edge Functions not available: invoke method not found')
      return {
        available: false,
        error: 'Edge Functions not available on this Supabase project or plan',
      }
    }
    
    // Try to invoke the function with a simple ping
    const { error } = await supabase.functions.invoke('deploy-site', {
      method: 'GET', // Use GET for a lighter request
      body: { ping: true },
    })
    
    if (error) {
      console.error('Edge Functions error:', error)
      return {
        available: false,
        error: error.message || 'Unknown error with Edge Functions',
      }
    }
    
    return {
      available: true,
    }
  } catch (error) {
    console.error('Failed to verify Edge Functions:', error)
    return {
      available: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}