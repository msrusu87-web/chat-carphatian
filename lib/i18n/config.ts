/**
 * Internationalization Configuration
 * 
 * Configuration for next-intl.
 * 
 * Built by Carphatian
 */

export const locales = ['en', 'ro', 'it', 'es', 'de', 'fr', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ro: 'Română',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  ro: '🇷🇴',
  it: '🇮🇹',
  es: '🇪🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
  pt: '🇵🇹',
}

// RTL languages (for future support)
export const rtlLocales: Locale[] = []

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}
