/**
 * Shared Type Definitions
 */

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  is_admin?: boolean;
  suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  role: 'owner' | 'admin' | 'member';
  joined_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountMember {
  id: string;
  email?: string;
  full_name?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at?: string;
}

export interface AccountDetails {
  account: {
    id: string;
    name: string;
    client_id?: string | null;
    created_at: string;
    updated_at: string;
  };
  user_role: 'owner' | 'admin' | 'member';
  members: AccountMember[];
}

export interface DashboardData {
  user: User | null;
  accounts: Account[];
  account_count: number;
}

export type UserRole = 'owner' | 'admin' | 'member';

export interface ApiError {
  error: string;
  message: string;
}

