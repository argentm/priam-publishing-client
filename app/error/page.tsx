import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn, ServerOff, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

interface ErrorPageProps {
  searchParams: Promise<{ code?: string; from?: string }>;
}

const ERROR_CONFIGS: Record<string, {
  icon: typeof AlertTriangle;
  title: string;
  message: string;
  showRetry: boolean;
  showLogin: boolean;
}> = {
  server_unavailable: {
    icon: ServerOff,
    title: 'Service Temporarily Unavailable',
    message: 'We\'re having trouble connecting to our servers. This is usually temporary. Please try again in a moment.',
    showRetry: true,
    showLogin: true,
  },
  api_error: {
    icon: WifiOff,
    title: 'Connection Error',
    message: 'Unable to communicate with the application. Please check your internet connection and try again.',
    showRetry: true,
    showLogin: true,
  },
  unauthorized: {
    icon: AlertTriangle,
    title: 'Session Expired',
    message: 'Your session has expired or is invalid. Please log in again to continue.',
    showRetry: false,
    showLogin: true,
  },
  forbidden: {
    icon: AlertTriangle,
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    showRetry: false,
    showLogin: true,
  },
  default: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    showRetry: true,
    showLogin: true,
  },
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const errorCode = params.code || 'default';
  const fromPath = params.from;

  const config = ERROR_CONFIGS[errorCode] || ERROR_CONFIGS.default;
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <IconComponent className="w-10 h-10 text-destructive" />
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{config.message}</p>
        </div>

        {/* Error Code (for support) */}
        {errorCode !== 'default' && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error code: {errorCode}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {config.showRetry && (
            <Button
              onClick={() => {
                // If we know where they came from, try to go back there
                if (fromPath) {
                  window.location.href = fromPath;
                } else {
                  window.location.reload();
                }
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}

          {config.showLogin && (
            <Button variant="outline" asChild className="gap-2">
              <Link href={ROUTES.LOGIN}>
                <LogIn className="w-4 h-4" />
                Return to Login
              </Link>
            </Button>
          )}
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
