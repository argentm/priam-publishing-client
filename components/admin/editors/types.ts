/**
 * Admin Work Editor Types
 *
 * Types specific to admin work editing functionality.
 * Reuses shared types where appropriate.
 */

// Re-export shared types that can be used in admin context
export type { EditorMode } from '@/components/shared/work-wizard/types';

/**
 * Admin Alternate Title
 * Represents an alternate/alias title for a work
 */
export interface AdminAlternateTitle {
  id?: string;
  tempId: string;
  title: string;
  title_type?: string | null;
  language?: string | null;
}

/**
 * Admin Performer
 * Represents a performer associated with a work
 */
export interface AdminPerformer {
  id?: string;
  tempId: string;
  performer_name: string;
}

/**
 * Admin Track
 * Represents a track/recording linked to a work
 */
export interface AdminTrack {
  id: string;
  title: string;
  isrc?: string | null;
  artist?: string | null;
}

/**
 * Admin Writer/Composer
 * Represents a composer with ownership information for a work
 */
export interface AdminWriter {
  tempId: string;
  composerId?: string;
  name: string;
  firstName?: string;
  surname?: string;
  cae?: string;
  mainPro?: string;
  role: string;
  share: number;
  isControlled: boolean;
  isNew: boolean;
  // Publisher for controlled writers
  publisherId?: string;
  publisherName?: string;
  // Advanced mode ownership fields
  mechanicalOwnership: number;
  performanceOwnership: number;
  mechanicalCollection: number;
  performanceCollection: number;
}

/**
 * Extended Work interface with all related data from admin API
 */
export interface AdminWorkFull {
  id: string;
  account_id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  foreign_id?: string | null;
  project_id?: string | null;
  identifier?: string | null;
  party_no?: number | null;
  notes?: string | null;
  grand_rights?: boolean;
  priority?: boolean;
  production_library?: boolean;
  work_language?: string | null;
  work_description_category?: string | null;
  duration?: number | null;
  composite_type?: string | null;
  composite_count?: number;
  version_type?: string | null;
  arrangement_type?: string | null;
  lyric_adaption_type?: string | null;
  original_work_title?: string | null;
  original_iswc?: string | null;
  original_work_writer_last_name?: string | null;
  original_work_writer_first_name?: string | null;
  original_work_source?: string | null;
  copyright_date?: string | null;
  label_copy?: string | null;
  valid?: boolean;
  validation_errors?: string[];
  approval_status?: string;
  approved_date?: string | null;
  on_hold?: boolean;
  total_participation?: number;
  rights_chain?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;

  // Related data from API
  account?: {
    id: string;
    name: string;
  };
  alternate_titles?: Array<{
    id: string;
    title: string;
    title_type?: string | null;
    language?: string | null;
  }>;
  composers?: Array<{
    id: string;
    composer_id: string;
    role?: string | null;
    share?: number | null;
    mechanical_ownership?: number | null;
    performance_ownership?: number | null;
    mechanical_collection?: number | null;
    performance_collection?: number | null;
    composer: {
      id: string;
      name: string;
      cae?: string | null;
      main_pro?: string | null;
      controlled?: boolean;
    };
  }>;
  performers?: Array<{
    id: string;
    performer_name: string;
  }>;
  tracks?: Array<{
    id: string;
    track_id: string;
    track: {
      id: string;
      title: string;
      isrc?: string | null;
      artist?: string | null;
    };
  }>;
}
