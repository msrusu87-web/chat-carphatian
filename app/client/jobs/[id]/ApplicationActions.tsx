/**
 * Application Actions Component
 * Client component for accepting/rejecting applications
 * Built by Carphatian
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PaymentModal = dynamic(() => import('./PaymentModal'), { ssr: false })

interface ApplicationActionsProps {
  applicationId: number
  jobId: number
  freelancerId: number
  jobTitle: string
  budget: number
}

export default function ApplicationActions({
  applicationId,
  jobId,
  freelancerId,
  jobTitle,
  budget
}: ApplicationActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const [showHireModal, setShowHireModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [contractId, setContractId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this application?')) return

    setLoading('reject')
    setError('')

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject application')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleAccept = async () => {
    setLoading('accept')
    setError('')

    try {
      // Create a contract (this also accepts the application and updates job status)
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          total_amount: budget,
        }),
      })

      if (!contractResponse.ok) {
        const data = await contractResponse.json()
        throw new Error(data.error || 'Failed to create contract')
      }

      const contractData = await contractResponse.json()
      setContractId(contractData.contract.id)
      setShowHireModal(false)
      setShowPaymentModal(true) // Open payment modal after contract created
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    router.push(`/client/contracts/${contractId}`)
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowHireModal(true)}
          disabled={loading !== null}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          ✓ Hire
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 text-sm"
        >
          {loading === 'reject' ? '...' : '✗ Reject'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}

      {/* Hire Confirmation Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Hire</h3>
            <p className="text-gray-400 mb-6">
              You are about to hire this freelancer for <strong className="text-white">"{jobTitle}"</strong>.
              This will create a contract and mark the job as in progress.
            </p>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Contract Value</span>
                <span className="text-white font-bold">${budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee (10%)</span>
                <span className="text-gray-300">${(budget * 0.1).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHireModal(false)}
                disabled={loading !== null}
                className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={loading !== null}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === 'accept' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  '✓ Confirm Hire'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && contractId && (
        <PaymentModal
          contractId={contractId}
          amount={budget}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  )
}
