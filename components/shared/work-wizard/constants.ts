// Shared constants for work creation wizards

// Performance Rights Organizations
export const PRO_LIST = [
  'PRS',
  'ASCAP',
  'BMI',
  'SOCAN',
  'GEMA',
  'SACEM',
  'SIAE',
  'SGAE',
  'JASRAC',
  'APRA',
  'IMRO',
  'MCPS',
  'SESAC',
  'KOMCA',
  'SABAM',
  'SUISA',
  'STIM',
  'BUMA',
  'TONO',
  'KODA',
  'TEOSTO',
  'AKM',
  'CASH',
  'SAMRO',
  'Other',
] as const;

// Writer Roles
export const WRITER_ROLES = [
  { value: 'CA', label: 'Composer/Author' },
  { value: 'C', label: 'Composer' },
  { value: 'A', label: 'Author/Lyricist' },
  { value: 'AR', label: 'Arranger' },
  { value: 'AD', label: 'Adapter' },
  { value: 'TR', label: 'Translator' },
] as const;

// Languages
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'he', label: 'Hebrew' },
] as const;

// Work Categories
export const WORK_CATEGORIES = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'r&b', label: 'R&B' },
  { value: 'country', label: 'Country' },
  { value: 'folk', label: 'Folk' },
  { value: 'latin', label: 'Latin' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'blues', label: 'Blues' },
  { value: 'metal', label: 'Metal' },
  { value: 'punk', label: 'Punk' },
  { value: 'soul', label: 'Soul' },
  { value: 'funk', label: 'Funk' },
  { value: 'world', label: 'World' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'other', label: 'Other' },
] as const;

// Version Types
export const VERSION_TYPES = [
  { value: 'original', label: 'Original Work' },
  { value: 'arrangement', label: 'Arrangement' },
  { value: 'adaptation', label: 'Adaptation' },
  { value: 'translation', label: 'Translation' },
  { value: 'remix', label: 'Remix' },
  { value: 'cover', label: 'Cover' },
] as const;

// Arrangement Types
export const ARRANGEMENT_TYPES = [
  { value: 'original', label: 'Original Arrangement' },
  { value: 'new', label: 'New Arrangement' },
  { value: 'modified', label: 'Modified Arrangement' },
] as const;

// Composite Types
export const COMPOSITE_TYPES = [
  { value: 'none', label: 'Not a Composite' },
  { value: 'medley', label: 'Medley' },
  { value: 'potpourri', label: 'Potpourri' },
  { value: 'composite', label: 'Composite' },
] as const;

// System Priam Publisher ID (for controlled writers)
export const SYSTEM_PRIAM_PUBLISHER_ID = '00000000-0000-0000-0000-000000000001';

// Territories for IP Chain
export const TERRITORIES = [
  { code: 'World', name: 'World (All Territories)' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'ZA', name: 'South Africa' },
] as const;

// Default work form data
export const DEFAULT_WORK_FORM_DATA = {
  title: '',
  iswc: '',
  tunecode: '',
  notes: '',
  priority: false,
  productionLibrary: false,
  grandRights: false,
};

// Default work details data
export const DEFAULT_WORK_DETAILS_DATA = {
  compositeCount: 0,
};

// Create an empty writer template
export const createEmptyWriter = (tempId: string): import('./types').Writer => ({
  tempId,
  isNew: true,
  isControlled: true,
  name: '',
  role: 'CA',
  share: 0,
  mechanicalOwnership: 0,
  performanceOwnership: 0,
  mechanicalCollection: 0,
  performanceCollection: 0,
});
