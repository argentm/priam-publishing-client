import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getOrigin } from '@/lib/utils/get-origin';

async function handleSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Get origin from environment variable
  const origin = getOrigin();

  return NextResponse.redirect(`${origin}/login`, {
    status: 302,
  });
}

export async function POST() {
  return handleSignOut();
}

// NOTE: GET handler intentionally removed to prevent CSRF attacks
// All logout requests must use POST method
