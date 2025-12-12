/**
 * PWA Install Banner
 * 
 * Shows a banner prompting users to install the app.
 * 
 * Built by Carphatian
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { useInstallPrompt } from '@/lib/pwa/hooks'

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedAt = new Date(dismissed)
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSince < 7) {
        setIsDismissed(true)
      }
    }
  }, [])

  if (!isInstallable || isInstalled || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  const handleInstall = async () => {
    const installed = await promptInstall()
    if (!installed) {
      handleDismiss()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Install Carphatian</p>
            <p className="text-sm text-white/80">
              Get the full experience with our app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
