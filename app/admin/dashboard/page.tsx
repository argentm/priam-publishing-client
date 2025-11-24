import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Building2, Shield, ArrowRight, Music, Disc, FileText } from 'lucide-react';

async function getAdminStats() {
  const client = await createServerApiClient();
  try {
    const [usersStats, accountsStats, worksStats, tracksStats, contractsStats] = await Promise.all([
      client.get<{ total: number; admins: number }>(API_ENDPOINTS.ADMIN_USERS + '/stats').catch(() => ({ total: 0, admins: 0 })),
      client.get<{ total: number }>(API_ENDPOINTS.ADMIN_ACCOUNTS + '/stats').catch(() => ({ total: 0 })),
      client.get<{ total: number; valid: number; invalid: number }>(API_ENDPOINTS.ADMIN_WORKS + '/stats').catch(() => ({ total: 0, valid: 0, invalid: 0 })),
      client.get<{ total: number }>(API_ENDPOINTS.ADMIN_TRACKS + '/stats').catch(() => ({ total: 0 })),
      client.get<{ total: number; active: number; complete: number }>(API_ENDPOINTS.ADMIN_CONTRACTS + '/stats').catch(() => ({ total: 0, active: 0, complete: 0 })),
    ]);
    return { 
      users: usersStats.total || 0, 
      admins: usersStats.admins || 0,
      accounts: accountsStats.total || 0,
      works: worksStats.total || 0,
      tracks: tracksStats.total || 0,
      contracts: contractsStats.total || 0,
    };
  } catch {
    return { users: 0, admins: 0, accounts: 0, works: 0, tracks: 0, contracts: 0 };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage users, accounts, and system settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Users
            </CardTitle>
            <CardDescription>Registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.admins} admin{stats.admins !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Total Accounts
            </CardTitle>
            <CardDescription>Active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.accounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Total Works
            </CardTitle>
            <CardDescription>Musical works/compositions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.works}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="w-5 h-5" />
              Total Tracks
            </CardTitle>
            <CardDescription>Recordings/tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.tracks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Total Contracts
            </CardTitle>
            <CardDescription>Publishing contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.contracts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Healthy</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={ROUTES.ADMIN_USERS}>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage Users
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={ROUTES.ADMIN_ACCOUNTS}>
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Manage Accounts
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={ROUTES.ADMIN_WORKS}>
                <span className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Manage Works
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={ROUTES.ADMIN_TRACKS}>
                <span className="flex items-center gap-2">
                  <Disc className="w-4 h-4" />
                  Manage Tracks
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={ROUTES.ADMIN_CONTRACTS}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Manage Contracts
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Overview of system metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Users:</span>
              <span className="font-medium">{stats.users}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Admin Users:</span>
              <span className="font-medium">{stats.admins}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accounts:</span>
              <span className="font-medium">{stats.accounts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Works:</span>
              <span className="font-medium">{stats.works}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tracks:</span>
              <span className="font-medium">{stats.tracks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contracts:</span>
              <span className="font-medium">{stats.contracts}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

