/**
 * API Error Sanitization Utility
 *
 * Prevents internal error details from being exposed to users.
 * API errors can contain sensitive information like database structure,
 * internal paths, or implementation details.
 */

// Patterns that are safe to show to users
const SAFE_ERROR_PATTERNS = [
  /not found/i,
  /permission denied/i,
  /access denied/i,
  /unauthorized/i,
  /invalid/i,
  /already exists/i,
  /duplicate/i,
  /required/i,
  /must be/i,
  /cannot be/i,
  /too long/i,
  /too short/i,
  /rate limit/i,
  /try again/i,
];

// Patterns that indicate internal errors we should NOT expose
const UNSAFE_ERROR_PATTERNS = [
  /sql/i,
  /postgres/i,
  /database/i,
  /supabase/i,
  /internal server/i,
  /stack trace/i,
  /at line/i,
  /undefined/i,
  /null reference/i,
  /cannot read property/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
];

/**
 * Sanitizes API error messages to prevent internal details from being exposed.
 *
 * @param error - The error to sanitize (can be Error, string, or unknown)
 * @param fallback - The fallback message to show if error is unsafe
 * @returns A sanitized error message safe to display to users
 */
export function sanitizeApiError(error: unknown, fallback: string): string {
  const message = getErrorMessage(error);

  // Check if it contains unsafe patterns - use fallback
  const isUnsafe = UNSAFE_ERROR_PATTERNS.some((pattern) =>
    pattern.test(message)
  );

  if (isUnsafe) {
    return fallback;
  }

  // Check if it matches safe patterns - allow through
  const isSafe = SAFE_ERROR_PATTERNS.some((pattern) => pattern.test(message));

  if (isSafe) {
    return message;
  }

  // Unknown error pattern - use fallback to be safe
  return fallback;
}

/**
 * Extracts error message from various error types.
 * Handles Error objects, strings, and objects with message property.
 *
 * @param error - The error to extract message from
 * @returns The error message as a string
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

/**
 * Common fallback messages for different operations
 */
export const API_ERROR_FALLBACKS = {
  fetch: 'Failed to load data. Please try again.',
  create: 'Failed to create. Please try again.',
  update: 'Failed to save changes. Please try again.',
  delete: 'Failed to delete. Please try again.',
  generic: 'An error occurred. Please try again.',
} as const;
