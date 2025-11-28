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
  
  // Only log token issues in development - NEVER log token data in production
  if (process.env.NODE_ENV === 'development') {
    if (!session?.access_token) {
      console.warn('No access token found in session', {
        hasSession: !!session,
        expiresAt: session?.expires_at,
      });
    }
  }
  
  return new ApiClient(async () => session?.access_token || null);
}

