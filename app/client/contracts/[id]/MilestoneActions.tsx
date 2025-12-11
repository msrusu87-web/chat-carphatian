/**
 * Milestone Actions Component
 * Client-side actions for releasing payments and managing milestones
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MilestoneActionsProps {
  milestoneId: number
  contractId: number
  amount: number
  title: string
}

export default function MilestoneActions({
  milestoneId,
  contractId,
  amount,
  title,
}: MilestoneActionsProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleRelease = async () => {
    if (!confirm(`Release payment of $${amount.toLocaleString()} for "${title}"?\n\nThis action cannot be undone.`)) {
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/milestones/${milestoneId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to release payment')
      }

      // Refresh the page to show updated status
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to release payment')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-red-400 text-xs">
          {error}
        </div>
      )}
      
      <button
        onClick={handleRelease}
        disabled={processing}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            Releasing...
          </>
        ) : (
          <>💰 Release Payment</>
        )}
      </button>
    </div>
  )
}
