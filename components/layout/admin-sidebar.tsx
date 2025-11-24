'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Music,
  Radio,
  FileText,
  UserCog,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

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
}

const AdminNavContent = ({ onClose }: { onClose?: () => void }) => {
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
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold gradient-text">PRIAM</div>
            <div className="text-xs text-white/50">Control Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn(sectionIndex > 0 && 'mt-6')}>
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
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
                          ? 'bg-primary text-white font-semibold'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 mr-3 transition-transform',
                        active ? 'scale-110' : 'group-hover:scale-105'
                      )} />
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                      {item.badge && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          active 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/10 text-white/60'
                        )}>
                          {item.badge}
                        </span>
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
          className="flex items-center px-3 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to App</span>
        </Link>
      </div>
    </>
  );
};

export function AdminSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-40 ui-sidebar">
        <AdminNavContent />
      </aside>
    </>
  );
}

export function MobileAdminSidebar({ onClose }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full ui-sidebar">
      <AdminNavContent onClose={onClose} />
    </div>
  );
}
