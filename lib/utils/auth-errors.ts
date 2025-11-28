/**
 * Auth Error Sanitization Utility
 *
 * Prevents user enumeration attacks by replacing specific error messages
 * with generic ones that don't reveal whether an email exists in the system.
 */

// Error messages that could reveal user existence
const ENUMERATION_PATTERNS = [
  /user.*already.*registered/i,
  /user.*already.*exists/i,
  /email.*already.*registered/i,
  /email.*already.*in.*use/i,
  /email.*already.*exists/i,
  /user.*not.*found/i,
  /no.*user.*found/i,
  /invalid.*password/i,
  /password.*incorrect/i,
  /wrong.*password/i,
];

// Generic messages that don't reveal user existence
const GENERIC_MESSAGES = {
  login: 'Invalid email or password. Please check your credentials and try again.',
  signup: 'Unable to create account. Please try again or use a different email address.',
  passwordReset:
    'If an account exists with this email, you will receive a password reset link.',
};

export type AuthErrorContext = 'login' | 'signup' | 'passwordReset';

/**
 * Sanitizes authentication error messages to prevent user enumeration.
 *
 * @param errorMessage - The original error message from Supabase
 * @param context - The auth context (login, signup, passwordReset)
 * @returns A sanitized error message safe to display to users
 */
export function sanitizeAuthError(
  errorMessage: string,
  context: AuthErrorContext
): string {
  // Check if the error message matches any enumeration pattern
  const isEnumerationRisk = ENUMERATION_PATTERNS.some((pattern) =>
    pattern.test(errorMessage)
  );

  if (isEnumerationRisk) {
    return GENERIC_MESSAGES[context];
  }

  // For other errors, we can show them but still sanitize certain details
  // Common safe errors to pass through:
  const safeErrors = [
    /invalid.*login.*credentials/i, // Supabase's generic login error (safe)
    /email.*not.*confirmed/i, // Email confirmation needed
    /rate.*limit/i, // Rate limiting
    /too.*many.*requests/i, // Rate limiting
    /network/i, // Network errors
    /timeout/i, // Timeout errors
    /password.*must.*be/i, // Password requirements
    /password.*should/i, // Password requirements
    /weak.*password/i, // Weak password
  ];

  const isSafeError = safeErrors.some((pattern) => pattern.test(errorMessage));

  if (isSafeError) {
    return errorMessage;
  }

  // For any other unrecognized errors, use a generic message
  // This prevents leaking unexpected error details
  return GENERIC_MESSAGES[context];
}

/**
 * Helper to extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
