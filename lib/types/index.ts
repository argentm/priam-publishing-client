/**
 * Shared Type Definitions
 */

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
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

export type PermissionLevel = 'none' | 'view' | 'edit';

export interface AccountMember {
  id: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'owner' | 'admin' | 'member';
  permissions_catalog?: PermissionLevel;
  permissions_business?: PermissionLevel;
  joined_at?: string;
}

export interface AccountInvite {
  id: string;
  account_id: string;
  email: string;
  token: string;
  invited_by: string;
  permissions_catalog: PermissionLevel;
  permissions_business: PermissionLevel;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
  inviter?: {
    id: string;
    email?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  account?: {
    id: string;
    name: string;
  };
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

// Onboarding Types
export type OnboardingStatus = 'pending_email' | 'pending_account' | 'pending_identity' | 'active';

export interface OnboardingStatusResponse {
  onboarding_status: OnboardingStatus;
  current_step: number; // 1-4
  steps: {
    email_verified: boolean;
    account_created: boolean;
    identity_verified: boolean;
  };
  user: {
    id: string;
    email?: string | null;
    full_name?: string | null;
    tos_accepted_at?: string | null;
    verified_at?: string | null;
  };
  limits: {
    max_accounts: number;
    max_controlled_writers_per_account: number;
    accounts_used: number;
  };
  is_read_only: boolean;
}

export interface AcceptTosResponse {
  message: string;
  tos_accepted_at: string;
  tos_version: string;
}

export interface OnboardingCreateAccountResponse {
  account: AccountWithSpotify;
  message: string;
  next_step: 'verify_identity' | 'complete';
}

export interface SkipIdentityResponse {
  message: string;
  onboarding_status: OnboardingStatus;
  is_read_only: boolean;
}

// Spotify Integration Types
export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  followers?: { total: number };
}

export interface SpotifySuggestion {
  spotify_track_id: string;
  title: string;
  duration_seconds: number;
  isrc?: string;
  release_date: string;
  album_name: string;
  album_id: string;
  album_image_url?: string;
  performers: string[];
  spotify_url: string;
  preview_url?: string | null;
}

export interface AccountWithSpotify {
  id: string;
  name: string;
  client_id?: string | null;
  spotify_artist_id?: string | null;
  spotify_artist_name?: string | null;
  spotify_artist_image_url?: string | null;
  spotify_linked_at?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  created_at: string;
  updated_at: string;
}

// Composer type
export interface Composer {
  id: string;
  account_id: string;
  name: string;
  first_name?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
  created_at: string;
  updated_at: string;
}

// Work composer join type (from API)
export interface WorkComposer {
  id: string;
  composer_id: string;
  role?: string | null;
  share?: number | null;
  composer: {
    id: string;
    name: string;
    cae?: string | null;
    main_pro?: string | null;
    controlled?: boolean;
  };
}

// Work type
export interface Work {
  id: string;
  account_id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  duration?: number | null;
  notes?: string | null;
  work_language?: string | null;
  work_description_category?: string | null;
  version_type?: string | null;
  arrangement_type?: string | null;
  lyric_adaption_type?: string | null;
  composite_type?: string | null;
  composite_count?: number;
  copyright_date?: string | null;
  label_copy?: string | null;
  grand_rights?: boolean;
  priority?: boolean;
  production_library?: boolean;
  original_work_title?: string | null;
  original_iswc?: string | null;
  original_work_writer_first_name?: string | null;
  original_work_writer_last_name?: string | null;
  original_work_source?: string | null;
  approval_status?: string;
  approved_date?: string | null;
  on_hold?: boolean;
  valid?: boolean;
  validation_errors?: string[];
  spotify_track_id?: string | null;
  spotify_imported_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data from API
  composers?: WorkComposer[];
  performers?: Array<{ id: string; name: string }>;
  account?: {
    id: string;
    name: string;
  };
}

