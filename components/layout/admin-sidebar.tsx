'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: ROUTES.ADMIN_USERS,
    icon: Users,
  },
  {
    name: 'Accounts',
    href: ROUTES.ADMIN_ACCOUNTS,
    icon: Building2,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.ADMIN_DASHBOARD) {
      return pathname === ROUTES.ADMIN_DASHBOARD;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
      <div className="flex items-center justify-center h-16 px-4 border-b border-border">
        <div className="text-2xl font-bold text-primary">PP Admin</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Shield className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Back to App</span>
        </Link>
      </div>
    </div>
  );
}

