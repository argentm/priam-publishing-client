'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music2, Loader2, CheckCircle, XCircle, Clock, Users, Shield } from 'lucide-react';
import type { AccountInvite, PermissionLevel } from '@/lib/types';

interface InviteResponse {
  invite: AccountInvite;
}

interface AcceptResponse {
  success: boolean;
  account_id: string;
}

function formatPermission(level: PermissionLevel): string {
  switch (level) {
    case 'edit': return 'Can edit';
    case 'view': return 'Can view';
    case 'none': return 'No access';
    default: return level;
  }
}

export default function AcceptInvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const supabase = createClient();

  const [invite, setInvite] = useState<AccountInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthAndFetchInvite() {
      // Check authentication status
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id ?? null);

      // Fetch invite details (public endpoint)
      try {
        const apiClient = new ApiClient(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          return session?.access_token || null;
        });

        const response = await apiClient.get<InviteResponse>(API_ENDPOINTS.INVITE_BY_TOKEN(token));
        setInvite(response.invite);
      } catch (err) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Invite not found or has expired');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchInvite();
  }, [token, supabase.auth]);

  const handleAccept = async () => {
    if (!invite) return;

    setAccepting(true);
    setError(null);

    try {
      const apiClient = new ApiClient(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
      });

      const response = await apiClient.post<AcceptResponse>(API_ENDPOINTS.ACCEPT_INVITE(token));

      if (response.success) {
        setAccepted(true);
        // Redirect to the account after a brief delay
        setTimeout(() => {
          router.push(ROUTES.ACCOUNT(response.account_id));
        }, 2000);
      }
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  // Calculate invite states
  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false;
  const isAlreadyAccepted = invite?.accepted_at !== null && invite?.accepted_at !== undefined;
  const isOwnInvite = currentUserId && invite?.invited_by === currentUserId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href={ROUTES.LOGIN}>
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Welcome to the team!</CardTitle>
            <CardDescription>
              You&apos;ve successfully joined {invite?.account?.name}. Redirecting you now...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Priam</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            You&apos;ve been invited to collaborate
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Join your team and start managing music rights, catalogs, and royalties together.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} Priam Publishing. All rights reserved.
        </div>
      </div>

      {/* Right side - Invite Details */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Priam</span>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{invite?.account?.name}</CardTitle>
                  <CardDescription>Team Invitation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invite Status */}
              {isExpired && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm p-4 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  This invite has expired. Please ask for a new invitation.
                </div>
              )}

              {isAlreadyAccepted && (
                <div className="bg-muted text-muted-foreground text-sm p-4 rounded-lg border flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  This invite has already been used.
                </div>
              )}

              {isOwnInvite && !isExpired && !isAlreadyAccepted && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm p-4 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  You created this invite. Share the link with the person you want to invite.
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Invite Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Invited by</p>
                  <p className="font-medium">
                    {invite?.inviter?.full_name || invite?.inviter?.email || 'Team Member'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your permissions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Catalog: {formatPermission(invite?.permissions_catalog || 'none')}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Business: {formatPermission(invite?.permissions_business || 'none')}
                    </Badge>
                  </div>
                </div>

                {!isExpired && !isAlreadyAccepted && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expires {new Date(invite?.expires_at || '').toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isExpired && !isAlreadyAccepted && !isOwnInvite && (
                <div className="space-y-3 pt-2">
                  {isAuthenticated ? (
                    <Button
                      onClick={handleAccept}
                      disabled={accepting}
                      className="w-full h-12"
                    >
                      {accepting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining team...
                        </>
                      ) : (
                        'Accept Invitation'
                      )}
                    </Button>
                  ) : (
                    <>
                      <p className="text-sm text-center text-muted-foreground">
                        Sign in or create an account to accept this invitation
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`${ROUTES.LOGIN}?redirect=/invite/${token}`}>
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href={`${ROUTES.SIGNUP}?redirect=/invite/${token}&email=${encodeURIComponent(invite?.email || '')}`}>
                          <Button className="w-full">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}

              {(isExpired || isAlreadyAccepted || isOwnInvite) && (
                <Link href={ROUTES.DASHBOARD} className="block">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By accepting this invitation, you agree to collaborate within this account&apos;s workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
