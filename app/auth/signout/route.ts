import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/lib/constants';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(ROUTES.LOGIN, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

