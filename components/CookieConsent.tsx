/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent UI
 * Built by Carphatian
 */
'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Check } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean // Always true
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    } else {
      try {
        setPreferences(JSON.parse(consent))
      } catch {
        // Invalid consent data, show banner
        setIsVisible(true)
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setPreferences(prefs)
    setIsVisible(false)
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })
  }

  const rejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    })
  }

  const saveCustom = () => {
    savePreferences(preferences)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Cookie className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                We value your privacy 🍪
              </h3>
              <p className="text-gray-400 text-sm">
                We use cookies to enhance your browsing experience, serve personalized content, 
                and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                Read our{' '}
                <a href="/privacy" className="text-purple-400 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/cookies" className="text-purple-400 hover:underline">
                  Cookie Policy
                </a>{' '}
                for more information.
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={acceptAll}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Accept All
            </button>
            <button
              onClick={rejectAll}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-6 py-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Customize'}
            </button>
          </div>
        </div>

        {/* Cookie Details */}
        {showDetails && (
          <div className="border-t border-gray-700 p-6 space-y-4">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Necessary Cookies</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Essential for the website to function. Cannot be disabled.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-400">Always Active</span>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Analytics Cookies</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.analytics ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Marketing Cookies</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Used to deliver personalized advertisements.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.marketing ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Preference Cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Preference Cookies</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Remember your settings and preferences.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, preferences: !preferences.preferences })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.preferences ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.preferences ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Save Custom Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={saveCustom}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
