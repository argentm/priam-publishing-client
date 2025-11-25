'use client';

import { ReactNode, useState } from 'react';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  user: User;
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <AdminHeader user={user} />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

