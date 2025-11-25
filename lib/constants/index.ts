/**
 * Application Constants
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ACCOUNT: (id: string) => `/admin/accounts/${id}`,
  ADMIN_WORKS: '/admin/works',
  ADMIN_TRACKS: '/admin/tracks',
  ADMIN_CONTRACTS: '/admin/contracts',
  ADMIN_PAYEES: '/admin/payees',
  ADMIN_COMPOSERS: '/admin/composers',
  ACCOUNT: (id: string) => `/dashboard/account/${id}`,
  ACCOUNT_NEW: '/dashboard/account/new',
  ACCOUNT_WORKS: (id: string) => `/dashboard/account/${id}/works`,
  ACCOUNT_WORKS_NEW: (id: string) => `/dashboard/account/${id}/works/new`,
  ACCOUNT_TRACKS: (id: string) => `/dashboard/account/${id}/tracks`,
  ACCOUNT_PAYEES: (id: string) => `/dashboard/account/${id}/payees`,
  ACCOUNT_CONTRACTS: (id: string) => `/dashboard/account/${id}/contracts`,
  ACCOUNT_USERS: (id: string) => `/dashboard/account/${id}/users`,
  ACCOUNT_SETTINGS: (id: string) => `/dashboard/account/${id}/settings`,
  ACCOUNT_SECURITY: (id: string) => `/dashboard/account/${id}/security`,
  // Workspace routes (aliases for account routes)
  WORKSPACE: (id: string) => `/dashboard/account/${id}`,
  WORKSPACE_WORKS: (id: string) => `/dashboard/account/${id}/works`,
  WORKSPACE_TRACKS: (id: string) => `/dashboard/account/${id}/tracks`,
  WORKSPACE_PAYEES: (id: string) => `/dashboard/account/${id}/payees`,
  WORKSPACE_CONTRACTS: (id: string) => `/dashboard/account/${id}/contracts`,
  WORKSPACE_USERS: (id: string) => `/dashboard/account/${id}/users`,
  WORKSPACE_SETTINGS: (id: string) => `/dashboard/account/${id}/settings`,
  WORKSPACE_SECURITY: (id: string) => `/dashboard/account/${id}/security`,
  WORKSPACE_COMPOSERS: (id: string) => `/dashboard/account/${id}/composers`,
  WORKSPACE_COMPOSERS_NEW: (id: string) => `/dashboard/account/${id}/composers/new`,
} as const;

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const API_ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  ACCOUNT: (id: string) => `/api/dashboard/account/${id}`,
  DASHBOARD_ACCOUNT: (id: string) => `/api/dashboard/account/${id}`,
  DASHBOARD_COMPOSERS: (accountId: string) => `/api/dashboard/account/${accountId}/composers`,
  ACCOUNTS: '/api/accounts',
  WORKS: '/api/works',
  COMPOSERS: '/api/composers',
  TRACKS: '/api/tracks',
  PAYEES: '/api/payees',
  CONTRACTS: '/api/contracts',
  AUTH_SESSION: '/api/auth/session',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_ACCOUNTS: '/api/admin/accounts',
  ADMIN_ACCOUNT: (id: string) => `/api/admin/accounts/${id}`,
  ADMIN_WORKS: '/api/admin/works',
  ADMIN_TRACKS: '/api/admin/tracks',
  ADMIN_CONTRACTS: '/api/admin/contracts',
  ADMIN_PAYEES: '/api/admin/payees',
  ADMIN_COMPOSERS: '/api/admin/composers',
} as const;
