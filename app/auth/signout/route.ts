import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

async function handleSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Get the host from headers (more reliable in production)
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

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
