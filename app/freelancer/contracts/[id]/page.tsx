/**
 * Freelancer Contract Detail Page
 * View contract details, upload deliverables
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import ContractAttachments from '@/components/ContractAttachments'
import ContractReviewSection from '@/components/ContractReviewSection'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function FreelancerContractDetailPage({ params }: PageProps) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const user = session.user as any
    const contractId = parseInt(id)

    if (isNaN(contractId)) {
        notFound()
    }

    // Get contract with all related data
    const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId),
        with: {
            job: true,
            client: true,
            freelancer: {
                with: {
                    profile: true,
                },
            },
            milestones: {
                orderBy: (milestones, { asc }) => [asc(milestones.created_at)],
            },
        },
    })

    if (!contract) {
        notFound()
    }

    // Check authorization
    const userId = parseInt(user.id)
    const isFreelancer = contract.freelancer_id === userId
    const isAdmin = user.role === 'admin'

    if (!isFreelancer && !isAdmin) {
        redirect('/freelancer/contracts')
    }

    const statusColors: Record<string, string> = {
        active: 'bg-green-500/20 text-green-400 border-green-500/50',
        completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
        disputed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    }

    const milestoneStatusColors: Record<string, string> = {
        pending: 'bg-gray-500/20 text-gray-400',
        in_escrow: 'bg-blue-500/20 text-blue-400',
        released: 'bg-green-500/20 text-green-400',
        refunded: 'bg-red-500/20 text-red-400',
    }

    const totalAmount = parseFloat(contract.total_amount || '0')
    const platformFee = parseFloat(contract.platform_fee || '0')
    const netAmount = totalAmount - platformFee

    const completedMilestones = contract.milestones.filter(m => m.status === 'released')
    const totalReleased = completedMilestones.reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0)
    const totalMilestones = contract.milestones.reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0)
    const progress = totalMilestones > 0 ? (totalReleased / totalMilestones) * 100 : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link
                    href="/freelancer/contracts"
                    className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2"
                >
                    ← Back to Contracts
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{contract.job.title}</h1>
                        <p className="text-gray-400 mt-1">Contract #{contract.id}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border font-semibold ${statusColors[contract.status] || statusColors.active}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contract Overview */}
                    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Your Earnings</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                <span className="text-gray-400">Total Amount</span>
                                <span className="text-2xl font-bold text-white">${totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                <span className="text-gray-400">Platform Fee (15%)</span>
                                <span className="text-white font-semibold">-${platformFee.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-semibold">You Receive</span>
                                <span className="text-2xl font-bold text-green-400">${netAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Payment Progress</span>
                                <span className="text-white font-semibold">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-2 text-gray-500">
                                <span>${totalReleased.toLocaleString()} received</span>
                                <span>${totalMilestones.toLocaleString()} total</span>
                            </div>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Payment Milestones</h2>

                        <div className="space-y-4">
                            {contract.milestones.map((milestone, index) => (
                                <div
                                    key={milestone.id}
                                    className="bg-gray-700/30 border border-gray-600 rounded-xl p-5"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                                            </div>
                                            {milestone.description && (
                                                <p className="text-gray-400 text-sm ml-11">{milestone.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-2xl font-bold text-white">${parseFloat(milestone.amount || '0').toLocaleString()}</div>
                                            {milestone.due_date && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Due: {new Date(milestone.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${milestoneStatusColors[milestone.status]}`}>
                                            {milestone.status === 'in_escrow' ? 'In Escrow - Awaiting Release' : milestone.status === 'released' ? '✓ Paid' : milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                                        </span>

                                        {milestone.status === 'released' && milestone.released_at && (
                                            <span className="text-xs text-gray-500">
                                                Received {new Date(milestone.released_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {contract.milestones.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📋</div>
                                    <p className="text-gray-400">No milestones defined yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Attachments */}
                    <ContractAttachments
                        contractId={contractId}
                        entityType="contract"
                        title="Contract Files"
                        description="Shared files and documents"
                        canUpload={true}
                    />

                    {/* Deliverables & Source Code */}
                    <ContractAttachments
                        contractId={contractId}
                        entityType="deliverable"
                        title="Upload Deliverables & Source Code"
                        description="Upload your completed work, source code, and documentation"
                        canUpload={true}
                    />

                    {/* Reviews Section */}
                    <ContractReviewSection
                        contractId={contractId}
                        contractStatus={contract.status}
                        isClient={false}
                        currentUserId={userId}
                        otherParty={{
                            id: contract.client_id,
                            name: contract.client.email,
                            role: 'client',
                        }}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Client</h3>

                        <div>
                            <div className="text-white font-semibold">{contract.client.email}</div>
                            <Link
                                href={`/freelancer/messages?client=${contract.client_id}`}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Message Client
                            </Link>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Created</span>
                                <span className="text-white">
                                    {new Date(contract.created_at!).toLocaleDateString()}
                                </span>
                            </div>

                            {contract.start_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Started</span>
                                    <span className="text-white">
                                        {new Date(contract.start_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {contract.end_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Completed</span>
                                    <span className="text-white">
                                        {new Date(contract.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {contract.status === 'active' && !contract.end_date && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                        </span>
                                        <span className="text-sm font-semibold">Active Contract</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Milestones</span>
                                <span className="text-white font-semibold">{contract.milestones.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Paid</span>
                                <span className="text-green-400 font-semibold">{completedMilestones.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pending</span>
                                <span className="text-yellow-400 font-semibold">
                                    {contract.milestones.filter(m => m.status === 'pending' || m.status === 'in_escrow').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
