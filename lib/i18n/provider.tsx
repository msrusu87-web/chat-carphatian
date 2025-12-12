/**
 * I18n Provider
 * 
 * Client-side provider for next-intl that reads locale from cookies.
 * 
 * Built by Carphatian
 */

'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { defaultLocale, locales, type Locale } from './config'

// Import all messages statically for client-side
import enMessages from '@/messages/en.json'
import roMessages from '@/messages/ro.json'
import itMessages from '@/messages/it.json'
import esMessages from '@/messages/es.json'
import deMessages from '@/messages/de.json'
import frMessages from '@/messages/fr.json'
import ptMessages from '@/messages/pt.json'

// Use Record type for flexibility with nested structures
const allMessages: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  ro: roMessages,
  it: itMessages,
  es: esMessages,
  de: deMessages,
  fr: frMessages,
  pt: ptMessages,
}

function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  
  const cookieLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1] as Locale | undefined
  
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }
  
  return defaultLocale
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocale(getLocaleFromCookie())
    setMounted(true)
    
    // Listen for locale changes (from LanguageSwitcher)
    const handleLocaleChange = () => {
      setLocale(getLocaleFromCookie())
    }
    
    // Check for cookie changes periodically
    const interval = setInterval(handleLocaleChange, 500)
    
    return () => clearInterval(interval)
  }, [])

  // Use default locale for SSR, actual locale after hydration
  const currentLocale = mounted ? locale : defaultLocale
  const messages = allMessages[currentLocale]

  return (
    <NextIntlClientProvider 
      locale={currentLocale} 
      messages={messages as Record<string, unknown>}
      timeZone="Europe/Bucharest"
    >
      {children}
    </NextIntlClientProvider>
  )
}

export default I18nProvider
