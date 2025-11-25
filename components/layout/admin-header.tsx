'use client';

import { useState } from 'react';
import { User, Menu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import type { User as UserType } from '@/lib/types';
import { MobileAdminSidebar } from './admin-sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  user: UserType;
}

interface PageInfo {
  title: string;
  description: string;
}

const pageInfoMap: Record<string, PageInfo> = {
  '/admin/dashboard': {
    title: 'Dashboard',
    description: 'Overview of system activity and metrics',
  },
  '/admin/users': {
    title: 'Users',
    description: 'Manage all users in the system',
  },
  '/admin/accounts': {
    title: 'Accounts',
    description: 'Manage all accounts in the system',
  },
  '/admin/composers': {
    title: 'Composers',
    description: 'Manage composers across all accounts',
  },
  '/admin/works': {
    title: 'Works',
    description: 'Manage all works across all accounts',
  },
  '/admin/works/new': {
    title: 'New Work',
    description: 'Create a new musical work',
  },
  '/admin/tracks': {
    title: 'Tracks',
    description: 'Manage all tracks across all accounts',
  },
  '/admin/tracks/new': {
    title: 'New Track',
    description: 'Create a new track',
  },
  '/admin/contracts': {
    title: 'Contracts',
    description: 'Manage all contracts across all accounts',
  },
  '/admin/contracts/new': {
    title: 'New Contract',
    description: 'Create a new contract',
  },
  '/admin/payees': {
    title: 'Payees',
    description: 'Manage all payees across all accounts',
  },
  '/admin/payees/new': {
    title: 'New Payee',
    description: 'Create a new payee',
  },
};

function getPageInfo(pathname: string): PageInfo {
  // Exact match first
  if (pageInfoMap[pathname]) {
    return pageInfoMap[pathname];
  }
  
  // Check for detail pages (e.g., /admin/works/[id])
  const segments = pathname.split('/');
  if (segments.length >= 4) {
    const basePath = `/${segments[1]}/${segments[2]}`;
    const baseInfo = pageInfoMap[basePath];
    if (baseInfo) {
      // It's a detail page
      return {
        title: `${baseInfo.title.replace(/s$/, '')} Details`,
        description: `View and edit ${baseInfo.title.toLowerCase().replace(/s$/, '')} information`,
      };
    }
  }
  
  return {
    title: 'Admin',
    description: 'System administration',
  };
}

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Admin', href: '/admin/dashboard' },
  ];
  
  if (segments.length > 1) {
    const section = segments[1];
    const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
    
    if (segments.length === 2) {
      breadcrumbs.push({ label: sectionLabel });
    } else {
      breadcrumbs.push({ label: sectionLabel, href: `/admin/${section}` });
      
      if (segments[2] === 'new') {
        breadcrumbs.push({ label: 'New' });
      } else {
        breadcrumbs.push({ label: 'Details' });
      }
    }
  }
  
  return breadcrumbs;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const displayName = user.full_name || user.email || 'Admin';
  
  const pageInfo = getPageInfo(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="bg-white sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-0 ui-sidebar">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <MobileAdminSidebar onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
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
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-accent to-secondary text-white flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
