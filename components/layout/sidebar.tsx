'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Music,
  Users,
  FileText,
  Settings,
  Shield,
  Radio,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface SidebarProps {
  userRole?: string;
  workspaceId?: string;
  onClose?: () => void;
}

const NavContent = ({ 
  userRole, 
  workspaceId, 
  onClose 
}: { 
  userRole?: string; 
  workspaceId?: string; 
  onClose?: () => void;
}) => {
  const pathname = usePathname();
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const baseNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: workspaceId ? ROUTES.WORKSPACE(workspaceId) : ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      name: 'Songs',
      href: workspaceId ? ROUTES.WORKSPACE_WORKS(workspaceId) : ROUTES.DASHBOARD,
      icon: Music,
    },
    {
      name: 'Tracks',
      href: workspaceId ? ROUTES.WORKSPACE_TRACKS(workspaceId) : ROUTES.DASHBOARD,
      icon: Radio,
    },
    {
      name: 'Writers',
      href: workspaceId ? ROUTES.WORKSPACE_PAYEES(workspaceId) : ROUTES.DASHBOARD,
      icon: Users,
    },
    {
      name: 'Contracts',
      href: workspaceId ? ROUTES.WORKSPACE_CONTRACTS(workspaceId) : ROUTES.DASHBOARD,
      icon: FileText,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      name: 'Users',
      href: workspaceId ? ROUTES.WORKSPACE_USERS(workspaceId) : ROUTES.DASHBOARD,
      icon: UserCog,
      adminOnly: true,
    },
    {
      name: 'Settings',
      href: workspaceId ? ROUTES.WORKSPACE_SETTINGS(workspaceId) : ROUTES.DASHBOARD,
      icon: Settings,
      adminOnly: true,
    },
  ];

  const allNavItems = [...baseNavItems, ...(isAdmin ? adminNavItems : [])];

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === ROUTES.DASHBOARD;
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-16 px-4 border-b border-border">
        <div className="text-2xl font-bold text-primary">PP</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
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
          href={workspaceId ? ROUTES.WORKSPACE_SECURITY(workspaceId) : '/dashboard/security'}
          onClick={handleLinkClick}
          className="flex items-center px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Shield className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Security</span>
        </Link>
      </div>
    </>
  );
};

export function Sidebar({ userRole, workspaceId }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex-col z-40">
        <NavContent userRole={userRole} workspaceId={workspaceId} />
      </aside>
    </>
  );
}

export function MobileSidebar({ userRole, workspaceId, onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <NavContent userRole={userRole} workspaceId={workspaceId} onClose={onClose} />
    </div>
  );
}

