'use client';

import { ReactNode, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { UserHeader } from './user-header';
import { UserSidebar } from './user-sidebar';
import type { User, Account } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
  user: User;
  accounts: Account[];
  currentAccount?: Account | null;
}

export function UserLayout({ children, user, accounts, currentAccount: defaultAccount }: UserLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Detect current account from URL path
  const currentAccount = useMemo(() => {
    // Match /dashboard/account/[id]
    const match = pathname.match(/\/dashboard\/account\/([a-f0-9-]+)/);
    if (match) {
      const accountId = match[1];
      const found = accounts.find(a => a.id === accountId);
      if (found) return found;
    }
    return defaultAccount;
  }, [pathname, accounts, defaultAccount]);

  return (
    <div className="min-h-screen bg-background">
      <UserSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        accounts={accounts}
        currentAccount={currentAccount}
      />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <UserHeader user={user} currentAccount={currentAccount} accounts={accounts} />
        
        {/* Suspended User Banner */}
        {user.suspended && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Your account has been suspended
                </p>
                <p className="text-xs text-destructive/80">
                  You can view your data but cannot make any changes. Please contact support if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

