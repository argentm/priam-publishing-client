'use client';

import { ReactNode, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { UserHeader } from './user-header';
import { UserSidebar } from './user-sidebar';
import type { User, Account } from '@/lib/types';
import { cn } from '@/lib/utils';

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
        <UserHeader user={user} currentAccount={currentAccount} />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

