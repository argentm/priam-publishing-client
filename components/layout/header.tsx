'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User as UserType } from '@/lib/types';

interface HeaderProps {
  user?: UserType | null;
  showActionBanner?: boolean;
  actionMessage?: string;
}

export function Header({ user, showActionBanner, actionMessage }: HeaderProps) {
  const displayName = user?.full_name || user?.email || 'User';

  return (
    <>
      {showActionBanner && (
        <div className="bg-destructive text-destructive-foreground px-6 py-3">
          <span className="text-sm font-medium">
            ▲ Action Needed: {actionMessage || 'Please verify your identity'}
          </span>
        </div>
      )}

      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
    </>
  );
}

