'use client';

/**
 * Global Error Boundary
 *
 * This catches errors that occur in the root layout or during initial hydration.
 * It must be a client component and must render its own <html> and <body> tags
 * since it replaces the entire document.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging (in production, send to error tracking service)
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#fafafa',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Message */}
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.75rem',
              }}
            >
              Something Went Wrong
            </h1>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              We encountered an unexpected error. Please try again or return to the login page.
            </p>

            {/* Error digest for support */}
            {error.digest && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  marginBottom: '1.5rem',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Try Again
              </button>
              <a
                href="/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                Return to Login
              </a>
            </div>

            {/* Support Link */}
            <p
              style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                color: '#9ca3af',
              }}
            >
              If this problem persists, please contact{' '}
              <a
                href="mailto:support@priamdigital.com"
                style={{ color: '#7c3aed' }}
              >
                support@priamdigital.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
