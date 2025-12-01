'use client';

/**
 * Identity Verification Component
 * 
 * Allows users to verify their identity using Stripe Identity
 */

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

// Initialize Stripe (you'll need to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface VerificationStatus {
  status: 'pending' | 'processing' | 'verified' | 'requires_input' | 'canceled';
  verified: boolean;
  verified_at: string | null;
  onboarding_status: 'pending' | 'profile_complete' | 'verified';
  last_error: {
    code: string;
    reason: string;
  } | null;
}

export function IdentityVerification() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = new ApiClient();

  // Fetch verification status on mount and set up polling
  useEffect(() => {
    fetchStatus();

    // Poll for status if processing
    let intervalId: NodeJS.Timeout;
    if (status?.status === 'processing') {
      intervalId = setInterval(fetchStatus, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status?.status]); // Re-run effect when status changes

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<VerificationStatus>(API_ENDPOINTS.VERIFICATION_STATUS);
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to load verification status. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!stripePromise) {
      setError('Stripe is not configured. Please contact support.');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      // Get return URL
      const returnUrl = `${window.location.origin}${window.location.pathname}`;

      // Create verification session
      const { client_secret, session_id } = await apiClient.post<{
        client_secret: string;
        session_id: string;
      }>(API_ENDPOINTS.VERIFICATION_CREATE_SESSION, {
        return_url: returnUrl,
      });

      // Load Stripe and start verification
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Start Stripe Identity verification
      // This will open a modal/iframe for the user to complete verification
      const { error: verifyError } = await stripe.verifyIdentity(client_secret);

      if (verifyError) {
        throw new Error(verifyError.message || 'Failed to start verification');
      }

      // If verification completes successfully, refresh status
      // Note: In production, webhooks will update the status automatically
      // This is just for immediate feedback
      setTimeout(() => {
        fetchStatus();
      }, 2000);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to start verification. Please try again.'));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isVerified = status?.verified === true;
  const needsInput = status?.status === 'requires_input';
  const isProcessing = status?.status === 'processing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>
          Verify your identity to complete your account setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {needsInput && status?.last_error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Verification needs attention:</strong> {status.last_error.reason}
              <br />
              <span className="text-sm text-muted-foreground">
                Error code: {status.last_error.code}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-3">
          {isVerified ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">Identity Verified</p>
                {status.verified_at && (
                  <p className="text-sm text-muted-foreground">
                    Verified on {new Date(status.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Verification Processing</p>
                <p className="text-sm text-muted-foreground">
                  Your verification is being processed. This may take a few minutes.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Identity Not Verified</p>
                <p className="text-sm text-muted-foreground">
                  Complete identity verification to access all features
                </p>
              </div>
            </>
          )}
        </div>

        {!isVerified && !isProcessing && (
          <div className="pt-4">
            <Button
              onClick={handleVerify}
              disabled={verifying || !stripePromise}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Verification...
                </>
              ) : (
                'Start Verification'
              )}
            </Button>
            {!stripePromise && (
              <p className="mt-2 text-sm text-muted-foreground">
                Stripe Identity is not configured. Please contact support.
              </p>
            )}
          </div>
        )}

        {isProcessing && (
          <Button onClick={fetchStatus} variant="outline" className="w-full">
            Refresh Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

