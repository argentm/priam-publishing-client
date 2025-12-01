// Shared types for work creation wizards

export interface Composer {
  id: string;
  name: string;
  first_name?: string | null;
  middle_names?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
}

export interface Track {
  id: string;
  title: string;
  isrc?: string | null;
  artist?: string | null;
}

export interface Writer {
  id?: string;
  tempId: string;
  isNew: boolean;
  isControlled: boolean;
  composerId?: string;
  name: string;
  firstName?: string;
  surname?: string;
  cae?: string;
  mainPro?: string;
  role: string;
  // Simple mode fields
  share: number;
  // Advanced mode fields
  mechanicalOwnership: number;
  performanceOwnership: number;
  mechanicalCollection: number;
  performanceCollection: number;
  publisherName?: string;
}

export interface WorkFormData {
  title: string;
  iswc: string;
  tunecode: string;
  notes: string;
  priority: boolean;
  productionLibrary: boolean;
  grandRights: boolean;
}

export interface WorkDetailsData {
  foreignId?: string;
  projectId?: string;
  workLanguage?: string;
  workDescriptionCategory?: string;
  duration?: number | null;
  compositeType?: string;
  compositeCount: number;
  versionType?: string;
  arrangementType?: string;
  copyrightDate?: string;
  labelCopy?: string;
  performers?: string[];
}

export type EditorMode = 'simple' | 'advanced';

export type WizardStep = 'basic' | 'writers' | 'recordings' | 'details' | 'review';

export interface WizardStepConfig {
  id: WizardStep;
  label: string;
  icon: 'music' | 'users' | 'radio' | 'settings' | 'check';
}

// API endpoint configuration for different contexts
export interface WizardApiConfig {
  getComposers: (accountId: string) => string;
  createComposer: (accountId: string) => string;
  getTracks: (accountId: string) => string;
  createTrack: string;
  createWork: string;
}

// Props for step components
export interface WorkInfoStepProps {
  workData: WorkFormData;
  onWorkDataChange: (data: WorkFormData) => void;
  detailsData: WorkDetailsData;
  onDetailsDataChange: (data: WorkDetailsData) => void;
  accountName?: string;
  onNext: () => void;
}

export interface WritersStepProps {
  accountId: string;
  writers: Writer[];
  onWritersChange: (writers: Writer[]) => void;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  existingComposers: Composer[];
  loadingComposers: boolean;
  onCreateComposer: (composer: Omit<Composer, 'id'>) => Promise<Composer>;
  onBack: () => void;
  onNext: () => void;
}

export interface RecordingsStepProps {
  accountId: string;
  linkedTracks: Track[];
  onLinkedTracksChange: (tracks: Track[]) => void;
  existingTracks: Track[];
  loadingTracks: boolean;
  onCreateTrack: (track: { title: string; isrc: string; artist?: string }) => Promise<Track>;
  onBack: () => void;
  onNext: () => void;
}

export interface DetailsStepProps {
  detailsData: WorkDetailsData;
  onDetailsDataChange: (data: WorkDetailsData) => void;
  linkedTracks: Track[];
  accountName?: string;
  onBack: () => void;
  onNext: () => void;
}

export interface ReviewStepProps {
  workData: WorkFormData;
  detailsData: WorkDetailsData;
  writers: Writer[];
  linkedTracks: Track[];
  saving: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export interface WizardProgressProps {
  steps: WizardStepConfig[];
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick?: (step: WizardStep) => void;
}
