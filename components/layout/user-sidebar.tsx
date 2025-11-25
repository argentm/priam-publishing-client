'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Music,
  Radio,
  FileText,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Plus,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Account } from '@/lib/types';

interface NavItem {
  name: string;
  href: string | ((accountId: string) => string);
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiresAccount?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const getNavSections = (accountId?: string): NavSection[] => [
  {
    items: [
      {
        name: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      {
        name: 'Works',
        href: accountId ? ROUTES.WORKSPACE_WORKS(accountId) : '#',
        icon: Music,
        requiresAccount: true,
      },
      {
        name: 'Tracks',
        href: accountId ? ROUTES.WORKSPACE_TRACKS(accountId) : '#',
        icon: Radio,
        requiresAccount: true,
      },
      {
        name: 'Composers',
        href: accountId ? `/dashboard/account/${accountId}/composers` : '#',
        icon: UserCircle,
        requiresAccount: true,
      },
    ],
  },
  {
    title: 'Business',
    items: [
      {
        name: 'Contracts',
        href: accountId ? ROUTES.WORKSPACE_CONTRACTS(accountId) : '#',
        icon: FileText,
        requiresAccount: true,
      },
      {
        name: 'Payees',
        href: accountId ? ROUTES.WORKSPACE_PAYEES(accountId) : '#',
        icon: UserCircle,
        requiresAccount: true,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        name: 'Account Settings',
        href: accountId ? ROUTES.WORKSPACE_SETTINGS(accountId) : '#',
        icon: Settings,
        requiresAccount: true,
      },
    ],
  },
];

interface AccountSwitcherProps {
  accounts: Account[];
  currentAccount?: Account | null;
  isCollapsed?: boolean;
}

function AccountSwitcher({ accounts, currentAccount, isCollapsed }: AccountSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleAccountSelect = (account: Account) => {
    // Navigate to the selected account's dashboard
    router.push(ROUTES.WORKSPACE(account.id));
    setOpen(false);
  };

  if (isCollapsed) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-12 p-0 justify-center hover:bg-white/10"
            title={currentAccount?.name || 'Select account'}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold text-sm">
              {currentAccount?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="right">
          <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs font-bold">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 truncate">{account.name}</span>
                {currentAccount?.id === account.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account/new" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full h-auto p-3 justify-between hover:bg-white/10 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
              {currentAccount?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {currentAccount?.name || 'Select Account'}
              </p>
              <p className="text-xs text-white/50 capitalize">
                {currentAccount?.role || 'No account selected'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-white/50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground text-center">
            No accounts yet
          </div>
        ) : (
          accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs font-bold">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{account.role}</p>
                </div>
                {currentAccount?.id === account.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/account/new" className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Create New Account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserSidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accounts: Account[];
  currentAccount?: Account | null;
}

const UserNavContent = ({ 
  onClose, 
  isCollapsed, 
  onToggleCollapse,
  accounts,
  currentAccount,
}: UserSidebarProps) => {
  const pathname = usePathname();
  const navSections = getNavSections(currentAccount?.id);

  const isActive = (href: string | ((id: string) => string)) => {
    const resolvedHref = typeof href === 'function' ? (currentAccount ? href(currentAccount.id) : '') : href;
    if (resolvedHref === ROUTES.DASHBOARD) {
      return pathname === ROUTES.DASHBOARD;
    }
    return pathname.startsWith(resolvedHref);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const getHref = (item: NavItem): string => {
    if (typeof item.href === 'function') {
      return currentAccount ? item.href(currentAccount.id) : '#';
    }
    return item.href;
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
              <div className="text-xs text-white/50">Publishing Portal</div>
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
                const href = getHref(item);
                const active = isActive(item.href);
                const disabled = item.requiresAccount && !currentAccount;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={disabled ? '#' : href}
                      onClick={disabled ? (e) => e.preventDefault() : handleLinkClick}
                      className={cn(
                        'flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group',
                        active
                          ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/30'
                          : disabled
                            ? 'text-white/30 cursor-not-allowed'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                        isCollapsed ? 'justify-center' : ''
                      )}
                      title={isCollapsed ? item.name : disabled ? 'Select an account first' : ''}
                    >
                      <Icon className={cn(
                        'w-5 h-5 transition-transform',
                        active ? 'scale-110' : disabled ? '' : 'group-hover:scale-105',
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

      {/* Footer - No accounts message */}
      {accounts.length === 0 && !isCollapsed && (
        <div className="p-4 mx-3 mb-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 text-white/70">
            <Building2 className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">No accounts yet</p>
              <p className="text-xs text-white/50">Create your first account to get started</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Switcher - Bottom */}
      <div className={cn("border-t border-white/10 mt-auto", isCollapsed ? "px-2 py-2" : "px-3 py-3")}>
        <AccountSwitcher 
          accounts={accounts} 
          currentAccount={currentAccount}
          isCollapsed={isCollapsed}
        />
      </div>
    </>
  );
};

export function UserSidebar({ 
  isCollapsed, 
  onToggleCollapse,
  accounts,
  currentAccount,
}: UserSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-full bg-black shadow-[2px_0_12px_rgba(0,0,0,0.5)] flex-col z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <UserNavContent 
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          accounts={accounts}
          currentAccount={currentAccount}
        />
      </aside>
    </>
  );
}

export function MobileUserSidebar({ onClose, accounts, currentAccount }: UserSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      <UserNavContent 
        onClose={onClose} 
        accounts={accounts}
        currentAccount={currentAccount}
      />
    </div>
  );
}

