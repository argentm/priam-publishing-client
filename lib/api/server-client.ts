/**
 * Server-side API client factory
 */

import { ApiClient } from './client';
import { createClient } from '@/lib/supabase/server';

export async function createServerApiClient() {
  const supabase = await createClient();
  
  // Try to get session - this should work in server components
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
  }
  
  if (!session?.access_token) {
    console.warn('No access token found in session', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      expiresAt: session?.expires_at,
    });
  } else {
    // Log token info for debugging (first 20 chars only for security)
    console.log('Token found:', {
      tokenPrefix: session.access_token.substring(0, 20) + '...',
      expiresAt: session.expires_at,
      expiresIn: session.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : null,
    });
  }
  
  return new ApiClient(async () => session?.access_token || null);
}

