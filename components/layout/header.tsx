'use client';

import { useState } from 'react';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { User as UserType } from '@/lib/types';
import { MobileSidebar } from './sidebar';

interface HeaderProps {
  user?: UserType | null;
  showActionBanner?: boolean;
  actionMessage?: string;
  userRole?: string;
  workspaceId?: string;
}

export function Header({ 
  user, 
  showActionBanner, 
  actionMessage,
  userRole,
  workspaceId 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileSidebar 
                userRole={userRole} 
                workspaceId={workspaceId}
                onClose={() => setMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Spacer */}
        <div className="hidden lg:flex flex-1"></div>

        {/* User Info and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign out
            </Button>
            <Button type="submit" variant="ghost" size="icon" className="sm:hidden">
              <User className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </header>
    </>
  );
}

