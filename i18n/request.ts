/**
 * i18n Request Configuration
 * 
 * This file is used by next-intl to load messages for each request.
 * It runs on the server for each page request.
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  // For now, we use the default locale (English)
  // When adding locale routing, this will read from URL/cookies
  const locale: Locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

