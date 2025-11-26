/**
 * i18n Configuration
 * 
 * Centralized configuration for internationalization.
 * Add new locales here when expanding language support.
 */

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Locale metadata for UI display (language switcher, etc.)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  // Add more locales here:
  // es: 'Español',
  // fr: 'Français',
  // de: 'Deutsch',
  // it: 'Italiano',
};

// Locale flags for UI (optional)
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  // es: '🇪🇸',
  // fr: '🇫🇷',
  // de: '🇩🇪',
  // it: '🇮🇹',
};

