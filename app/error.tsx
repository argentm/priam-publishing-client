'use client';

/**
 * Root Error Boundary
 *
 * This catches errors that occur within the root layout's children.
 * Unlike global-error.tsx, this works within the existing layout structure.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Something Went Wrong</h1>
          <p className="text-muted-foreground leading-relaxed">
            We encountered an unexpected error. Please try again or return to the login page.
          </p>
        </div>

        {/* Error digest for support */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Button variant="outline" asChild className="gap-2">
            <Link href={ROUTES.LOGIN}>
              <LogIn className="w-4 h-4" />
              Return to Login
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground pt-4">
          If this problem persists, please contact{' '}
          <a
            href="mailto:support@priamdigital.com"
            className="text-primary hover:underline"
          >
            support@priamdigital.com
          </a>
        </p>
      </div>
    </div>
  );
}
