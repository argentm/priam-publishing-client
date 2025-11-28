'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Building2,
  Music,
  Radio,
  FileText,
  UserCog,
  Wallet,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        name: 'Dashboard',
        href: ROUTES.ADMIN_DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Management',
    items: [
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
      {
        name: 'Composers',
        href: ROUTES.ADMIN_COMPOSERS,
        icon: UserCog,
      },
      {
        name: 'Publishers',
        href: ROUTES.ADMIN_PUBLISHERS,
        icon: Landmark,
      },
      {
        name: 'Payees',
        href: ROUTES.ADMIN_PAYEES,
        icon: Wallet,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        name: 'Works',
        href: ROUTES.ADMIN_WORKS,
        icon: Music,
      },
      {
        name: 'Tracks',
        href: ROUTES.ADMIN_TRACKS,
        icon: Radio,
      },
      {
        name: 'Contracts',
        href: ROUTES.ADMIN_CONTRACTS,
        icon: FileText,
      },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminNavContent = ({ 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: { 
  onClose?: () => void; 
  isCollapsed?: boolean; 
  onToggleCollapse?: () => void;
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.ADMIN_DASHBOARD) {
      return pathname === ROUTES.ADMIN_DASHBOARD;
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
      {/* Header with Logo */}
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary/8 via-accent/8 to-secondary/8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/95 flex items-center justify-center shadow-lg p-1.5 flex-shrink-0">
            <Image 
              src="/logos/priam-icon.svg" 
              alt="Priam Digital" 
              width={32} 
              height={32}
              className="w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-lg font-bold gradient-text">PRIAM DIGITAL</div>
              <div className="text-xs text-white/60">Admin Panel</div>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 flex-shrink-0 text-primary hover:text-primary hover:bg-primary/10"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn(sectionIndex > 0 && 'mt-6')}>
            {section.title && !isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            {section.title && isCollapsed && (
              <div className="h-px bg-border/50 mx-3 mb-2" />
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group',
                        active
                          ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white',
                        isCollapsed ? 'justify-center' : ''
                      )}
                      title={isCollapsed ? item.name : ''}
                    >
                      <Icon className={cn(
                        'w-5 h-5 transition-transform',
                        active ? 'scale-110' : 'group-hover:scale-105',
                        !isCollapsed && 'mr-3'
                      )} />
                      {!isCollapsed && (
                        <>
                          <span className="text-sm font-medium flex-1">{item.name}</span>
                          {item.badge && (
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              active 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href={ROUTES.DASHBOARD}
          onClick={handleLinkClick}
          className={cn(
            "flex items-center px-3 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? 'Back to App' : ''}
        >
          <ArrowLeft className={cn(
            "w-5 h-5 group-hover:-translate-x-1 transition-transform",
            !isCollapsed && "mr-3"
          )} />
          {!isCollapsed && <span className="text-sm font-medium">Back to App</span>}
        </Link>
      </div>
    </>
  );
};

export function AdminSidebar({ 
  isCollapsed, 
  onToggleCollapse 
}: { 
  isCollapsed?: boolean; 
  onToggleCollapse?: () => void;
} = {}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-full bg-black shadow-[2px_0_12px_rgba(0,0,0,0.5)] flex-col z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <AdminNavContent 
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>
    </>
  );
}

export function MobileAdminSidebar({ onClose }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      <AdminNavContent onClose={onClose} />
    </div>
  );
}
