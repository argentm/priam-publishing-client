import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getOrigin } from '@/lib/utils/get-origin';

async function handleSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Get the correct origin from headers (not request.url which may be localhost)
  const origin = await getOrigin();

  return NextResponse.redirect(`${origin}/login`, {
    status: 302,
  });
}

export async function POST() {
  return handleSignOut();
}

export async function GET() {
  return handleSignOut();
}
