/**
 * Language Switcher Component
 * 
 * Dropdown button to switch between available languages.
 * Updates cookie and triggers page reload for new translations.
 * 
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'

interface LanguageSwitcherProps {
  currentLocale?: Locale
  variant?: 'floating' | 'inline' | 'compact'
}

export function LanguageSwitcher({ currentLocale = 'en', variant = 'inline' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [locale, setLocale] = useState<Locale>(currentLocale)

  useEffect(() => {
    // Read locale from cookie on mount
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined
    
    if (cookieLocale && locales.includes(cookieLocale)) {
      setLocale(cookieLocale)
    }
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }
    
    // Store preference in cookie with proper settings
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    
    // Update local state
    setLocale(newLocale)
    setIsOpen(false)
    
    // Force full page reload to apply new locale
    // This ensures server components also get the new locale
    window.location.href = window.location.href
  }

  const baseClasses = variant === 'floating' 
    ? 'fixed top-4 right-4 z-50'
    : variant === 'compact'
    ? 'relative'
    : 'relative'

  return (
    <div className={baseClasses}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          variant === 'floating'
            ? 'bg-card/95 backdrop-blur border border-border shadow-lg hover:shadow-xl hover:border-primary/50'
            : 'hover:bg-accent'
        }`}
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-lg">
          {localeFlags[locale]}
        </span>
        {variant !== 'compact' && (
          <>
            <span className="text-sm font-medium hidden sm:inline">
              {localeNames[locale]}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute z-50 mt-2 min-w-[180px] rounded-xl border border-border bg-card/95 backdrop-blur p-2 shadow-xl ${
            variant === 'floating' ? 'right-0' : 'right-0 top-full'
          }`}>
            <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
              Select Language
            </div>
            <div className="grid grid-cols-1 gap-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    loc === locale
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-lg">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                  {loc === locale && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
