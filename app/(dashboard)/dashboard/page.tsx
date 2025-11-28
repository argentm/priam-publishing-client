import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import Link from 'next/link';
import {
  ArrowRight,
  Plus,
  Building2,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { DashboardData, Account, OnboardingStatusResponse, OnboardingStatus } from '@/lib/types';
import { DashboardRedirect } from '@/components/user/dashboard-redirect';

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const client = await createServerApiClient();
    return await client.get<DashboardData>(API_ENDPOINTS.DASHBOARD);
  } catch {
    return null;
  }
}

async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  try {
    const client = await createServerApiClient();
    const response = await client.get<OnboardingStatusResponse>(API_ENDPOINTS.ONBOARDING_STATUS);
    return response.onboarding_status;
  } catch {
    return null;
  }
}

function WelcomeSection({ userName }: { userName?: string }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground">
        {greeting()}, {userName || 'there'}!
      </h1>
      <p className="text-muted-foreground mt-1">
        Select an account to get started
      </p>
    </div>
  );
}

function AccountsList({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Accounts
          </CardTitle>
          <CardDescription>
            Create your first account to start managing your music catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Create an account to start tracking your works, tracks, and contracts.
            </p>
            <Button asChild>
              <Link href={ROUTES.ACCOUNT_NEW}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Your Accounts
        </CardTitle>
        <CardDescription>
          Manage your publishing accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={ROUTES.WORKSPACE(account.id)}
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold text-lg">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {account.name}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {account.role}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.ACCOUNT_NEW}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Account
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest updates and changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Activity tracking coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  // Fetch dashboard data and onboarding status in parallel
  const [dashboardData, onboardingStatus] = await Promise.all([
    getDashboardData(),
    getOnboardingStatus(),
  ]);

  const accounts = dashboardData?.accounts || [];
  const user = dashboardData?.user;

  return (
    <DashboardRedirect accounts={accounts} onboardingStatus={onboardingStatus ?? undefined}>
      <div className="max-w-7xl mx-auto">
        <WelcomeSection
          userName={user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <AccountsList accounts={accounts} />
          <RecentActivity />
        </div>
      </div>
    </DashboardRedirect>
  );
}
