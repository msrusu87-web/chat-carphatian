/**
 * Contract Deliverables Upload Page
 * Freelancers upload source code and final deliverables
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import DeliverableUploadForm from './DeliverableUploadForm'

export default async function ContractDeliverablesPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const { id } = await params
    const contractId = parseInt(id)

    const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId),
        with: {
            job: true,
            client: true,
            freelancer: true,
        },
    })

    if (!contract) {
        return <div>Contract not found</div>
    }

    const user = session.user as any
    const userId = parseInt(user.id)

    // Verify user is the freelancer
    if (contract.freelancer_id !== userId && user.role !== 'admin') {
        redirect('/freelancer/contracts')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Upload Deliverables</h1>
                    <p className="text-gray-400">{contract.job?.title}</p>
                </div>

                {/* Contract Info */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Client</p>
                            <p className="text-white font-medium">{contract.client?.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Contract Value</p>
                            <p className="text-white font-medium">${contract.total_amount}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${contract.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                    contract.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                        'bg-gray-500/20 text-gray-400'
                                }`}>
                                {contract.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Started</p>
                            <p className="text-white font-medium">
                                {new Date(contract.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                <DeliverableUploadForm contractId={contractId} />
            </div>
        </div>
    )
}
