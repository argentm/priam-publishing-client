'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User as UserType } from '@/lib/types';

interface AdminHeaderProps {
  user: UserType;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const displayName = user.full_name || user.email || 'Admin';

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}

