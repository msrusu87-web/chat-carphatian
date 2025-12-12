/**
 * Offline Indicator
 * 
 * Shows when the user is offline.
 * 
 * Built by Carphatian
 */

'use client'

import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/lib/pwa/hooks'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium animate-in slide-in-from-top duration-200">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You're offline. Some features may be unavailable.</span>
      </div>
    </div>
  )
}
