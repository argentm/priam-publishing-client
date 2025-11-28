/**
 * Email Verification Confirmation Route
 *
 * Handles email verification links from Supabase.
 * Supports both token_hash (new) and code (legacy) formats.
 *
 * Expected URL formats:
 * - /auth/confirm?token_hash=xxx&type=email (Supabase recommended)
 * - /auth/confirm?code=xxx (PKCE flow)
 */

import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Support both token_hash and code parameters
  const token_hash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Build redirect URL for success case
  const successUrl = new URL('/onboarding/email-verified', origin);

  // Build redirect URL for error case
  const errorUrl = new URL('/onboarding/verify-email', origin);
  errorUrl.searchParams.set('error', 'verification_failed');

  const supabase = await createClient();

  // Handle token_hash verification (email confirmation)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('Email verification error:', error.message);
      errorUrl.searchParams.set('message', error.message);
      return NextResponse.redirect(errorUrl);
    }

    // Success - redirect to email verified page
    return NextResponse.redirect(successUrl);
  }

  // Handle code verification (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Code exchange error:', error.message);
      errorUrl.searchParams.set('message', error.message);
      return NextResponse.redirect(errorUrl);
    }

    // Success - redirect to email verified page
    return NextResponse.redirect(successUrl);
  }

  // No valid parameters provided
  errorUrl.searchParams.set('message', 'Invalid verification link');
  return NextResponse.redirect(errorUrl);
}
