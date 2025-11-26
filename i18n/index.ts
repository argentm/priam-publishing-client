/**
 * i18n Exports
 * 
 * Centralized exports for internationalization utilities.
 */

// Re-export next-intl hooks for convenience
export { useTranslations, useLocale, useNow, useTimeZone } from 'next-intl';

// Re-export config
export { locales, defaultLocale, localeNames, localeFlags, type Locale } from './config';

// Type for translation keys (for IDE autocomplete)
// This will be enhanced when you add more translations
export type TranslationNamespace = 
  | 'common'
  | 'auth'
  | 'navigation'
  | 'works'
  | 'tracks'
  | 'composers'
  | 'accounts'
  | 'dashboard'
  | 'errors'
  | 'validation';

