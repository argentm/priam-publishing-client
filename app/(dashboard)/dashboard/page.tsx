import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { 
  Music, 
  Radio, 
  FileText, 
  UserCircle, 
  ArrowRight, 
  Plus,
  Building2,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { DashboardData, Account } from '@/lib/types';

interface AccountStats {
  works_count: number;
  tracks_count: number;
  composers_count: number;
  contracts_count: number;
}

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const client = await createServerApiClient();
    return await client.get<DashboardData>(API_ENDPOINTS.DASHBOARD);
  } catch {
    return null;
  }
}

async function getAccountStats(accountId: string): Promise<AccountStats | null> {
  try {
    const client = await createServerApiClient();
    // Get stats for the account - using individual endpoints
    const [worksRes, tracksRes] = await Promise.all([
      client.get<{ works: any[]; total: number }>(`${API_ENDPOINTS.WORKS}?account_id=${accountId}&limit=1`).catch(() => ({ works: [], total: 0 })),
      client.get<{ tracks: any[]; total: number }>(`${API_ENDPOINTS.TRACKS}?account_id=${accountId}&limit=1`).catch(() => ({ tracks: [], total: 0 })),
    ]);
    
    return {
      works_count: worksRes.total || 0,
      tracks_count: tracksRes.total || 0,
      composers_count: 0, // Will implement when endpoint is available
      contracts_count: 0, // Will implement when endpoint is available
    };
  } catch {
    return null;
  }
}

function WelcomeSection({ userName, accountName }: { userName?: string; accountName?: string }) {
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
        {accountName 
          ? `Here's what's happening with ${accountName}`
          : 'Welcome to your publishing portal'
        }
      </p>
    </div>
  );
}

function StatsCards({ stats, accountId }: { stats: AccountStats | null; accountId?: string }) {
  const cards = [
    {
      title: 'Works',
      value: stats?.works_count || 0,
      description: 'Musical works registered',
      icon: Music,
      href: accountId ? ROUTES.WORKSPACE_WORKS(accountId) : null,
      color: 'from-secondary to-secondary/70',
    },
    {
      title: 'Tracks',
      value: stats?.tracks_count || 0,
      description: 'Recordings tracked',
      icon: Radio,
      href: accountId ? ROUTES.WORKSPACE_TRACKS(accountId) : null,
      color: 'from-accent to-accent/70',
    },
    {
      title: 'Composers',
      value: stats?.composers_count || 0,
      description: 'Writers registered',
      icon: UserCircle,
      href: accountId ? `/dashboard/account/${accountId}/composers` : null,
      color: 'from-primary to-primary/70',
    },
    {
      title: 'Contracts',
      value: stats?.contracts_count || 0,
      description: 'Active agreements',
      icon: FileText,
      href: accountId ? ROUTES.WORKSPACE_CONTRACTS(accountId) : null,
      color: 'from-green-500 to-green-500/70',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              {card.href && card.value > 0 && (
                <Button asChild variant="link" className="px-0 mt-2 h-auto" size="sm">
                  <Link href={card.href} className="text-primary">
                    View all <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function QuickActions({ accountId }: { accountId?: string }) {
  const actions = [
    {
      title: 'Add a New Work',
      description: 'Register a new musical composition',
      icon: Music,
      href: accountId ? `${ROUTES.WORKSPACE_WORKS(accountId)}/new` : null,
      color: 'bg-secondary/10 hover:bg-secondary/20 border-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      title: 'Add a New Track',
      description: 'Add a new recording to your catalog',
      icon: Radio,
      href: accountId ? `${ROUTES.WORKSPACE_TRACKS(accountId)}/new` : null,
      color: 'bg-accent/10 hover:bg-accent/20 border-accent/20',
      iconColor: 'text-accent',
    },
    {
      title: 'Add a Composer',
      description: 'Register a new writer or composer',
      icon: UserCircle,
      href: accountId ? `/dashboard/account/${accountId}/composers/new` : null,
      color: 'bg-primary/10 hover:bg-primary/20 border-primary/20',
      iconColor: 'text-primary',
    },
  ];

  if (!accountId) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            href={action.href || '#'}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${action.color}`}
          >
            <div className={`p-3 rounded-lg bg-white shadow-sm ${action.iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{action.title}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        );
      })}
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
  const dashboardData = await getDashboardData();
  
  const accounts = dashboardData?.accounts || [];
  const user = dashboardData?.user;
  const currentAccount = accounts.length > 0 ? accounts[0] : null;
  
  // Get stats for the current account
  const stats = currentAccount ? await getAccountStats(currentAccount.id) : null;

  return (
    <div className="max-w-7xl mx-auto">
      <WelcomeSection 
        userName={user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]} 
        accountName={currentAccount?.name}
      />
      
      {currentAccount && (
        <>
          <StatsCards stats={stats} accountId={currentAccount.id} />
          <QuickActions accountId={currentAccount.id} />
        </>
      )}
      
      <div className="grid gap-6 lg:grid-cols-2">
        <AccountsList accounts={accounts} />
        <RecentActivity />
      </div>
    </div>
  );
}
