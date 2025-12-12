/**
 * Request-based i18n
 * 
 * Provides locale detection for each request.
 * 
 * Built by Carphatian
 */

import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales, type Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // Use the incoming locale from the request, or fall back to default
  let locale = await requestLocale
  
  // Validate the locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
