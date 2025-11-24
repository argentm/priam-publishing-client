import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import type { User } from '@/lib/types';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: User | null;
  userRole?: string;
  workspaceId?: string;
  showActionBanner?: boolean;
  actionMessage?: string;
}

export function DashboardLayout({
  children,
  user,
  userRole,
  workspaceId,
  showActionBanner,
  actionMessage,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} workspaceId={workspaceId} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header
          user={user}
          showActionBanner={showActionBanner}
          actionMessage={actionMessage}
          userRole={userRole}
          workspaceId={workspaceId}
        />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

