import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/features/dashboard/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Account } from '@/lib/types';
import { ROUTES } from '@/lib/constants';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const dashboardData = await getDashboardData();
  const { accounts = [] } = dashboardData;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select an account to manage your publishing data
        </p>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>No accounts found</CardTitle>
            <CardDescription>
              Get started by creating your first account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={ROUTES.ACCOUNT_NEW}>Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account: Account) => (
            <Link
              key={account.id}
              href={ROUTES.ACCOUNT(account.id)}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription className="capitalize">
                    Role: {account.role}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button asChild>
          <Link href={ROUTES.ACCOUNT_NEW}>Create New Account</Link>
        </Button>
      </div>
    </>
  );
}

