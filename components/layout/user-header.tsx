'use client';

import { useState, useEffect } from 'react';
import { User, Menu, ChevronRight, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as UserType, Account } from '@/lib/types';
import { MobileUserSidebar } from './user-sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface UserHeaderProps {
  user: UserType;
  currentAccount?: Account | null;
  accounts?: Account[];
}

interface PageInfo {
  title: string;
  description: string;
}

const pageInfoMap: Record<string, PageInfo> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Welcome to your publishing portal',
  },
};

function getPageInfo(pathname: string, accountName?: string): PageInfo {
  // Exact match first
  if (pageInfoMap[pathname]) {
    return pageInfoMap[pathname];
  }
  
  // Account-specific pages
  if (pathname.includes('/dashboard/account/')) {
    const segments = pathname.split('/');
    const section = segments[4]; // After /dashboard/account/[id]/
    
    if (!section) {
      return {
        title: accountName || 'Account',
        description: 'Account overview and management',
      };
    }
    
    const sectionTitles: Record<string, PageInfo> = {
      'works': { title: 'Works', description: 'Manage your musical works and compositions' },
      'tracks': { title: 'Tracks', description: 'Manage your recordings and tracks' },
      'composers': { title: 'Composers', description: 'Manage composers and writers' },
      'contracts': { title: 'Contracts', description: 'Manage publishing contracts' },
      'payees': { title: 'Payees', description: 'Manage payment recipients' },
      'settings': { title: 'Settings', description: 'Account settings and configuration' },
    };
    
    return sectionTitles[section] || { title: 'Account', description: '' };
  }
  
  return {
    title: 'Dashboard',
    description: '',
  };
}

function getBreadcrumbs(pathname: string, accountName?: string): { label: string; href?: string }[] {
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
  ];
  
  if (pathname.includes('/dashboard/account/')) {
    const segments = pathname.split('/');
    const accountId = segments[3];
    const section = segments[4];
    
    if (accountId && accountId !== 'new') {
      breadcrumbs.push({ 
        label: accountName || 'Account', 
        href: section ? `/dashboard/account/${accountId}` : undefined 
      });
      
      if (section) {
        const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
        breadcrumbs.push({ label: sectionLabel });
      }
    } else if (accountId === 'new') {
      breadcrumbs.push({ label: 'New Account' });
    }
  }
  
  return breadcrumbs;
}

export function UserHeader({ user, currentAccount, accounts = [] }: UserHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const displayName = user.full_name || user.email || 'User';
  
  // Prevent hydration mismatch from Radix UI generated IDs
  useEffect(() => {
    setMounted(true);
  }, []);

  const pageInfo = getPageInfo(pathname, currentAccount?.name);
  const breadcrumbs = getBreadcrumbs(pathname, currentAccount?.name);

  return (
    <header className="bg-white sticky top-0 z-30 border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center">
          {mounted ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-0 ui-sidebar">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <MobileUserSidebar 
                  onClose={() => setMobileMenuOpen(false)} 
                  accounts={accounts}
                  currentAccount={currentAccount}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-9 h-9 bg-muted rounded animate-pulse" />
          )}
        </div>

        {/* Page Title and Breadcrumbs - Desktop */}
        <div className="hidden lg:flex items-center">
          <nav className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-1.5 text-muted-foreground" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Mobile Title */}
        <div className="lg:hidden flex-1 ml-2">
          <h1 className="text-base font-semibold text-foreground">{pageInfo.title}</h1>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center space-x-3">
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-muted/50">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentAccount?.name || 'No account selected'}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-accent to-secondary text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {currentAccount && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.WORKSPACE_SETTINGS(currentAccount.id)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user.is_admin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.ADMIN_DASHBOARD}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    // Submit signout form programmatically
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = '/auth/signout';
                    document.body.appendChild(form);
                    form.submit();
                  }}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <div className="hidden md:flex flex-col items-end">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse mt-1" />
              </div>
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

