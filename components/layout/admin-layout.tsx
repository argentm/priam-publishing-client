import { ReactNode } from 'react';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import type { User } from '@/lib/types';

interface AdminLayoutProps {
  children: ReactNode;
  user: User;
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

