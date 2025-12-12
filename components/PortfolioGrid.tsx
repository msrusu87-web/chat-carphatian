/**
 * Portfolio Grid Component
 * Display freelancer's portfolio items
 * Built by Carphatian
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import AddPortfolioModal from './AddPortfolioModal'

interface PortfolioItem {
    id: number
    title: string
    description: string | null
    tech_stack: string[]
    image_url: string | null
    project_url: string | null
    completion_date: string | null
    created_at: string
}

interface PortfolioGridProps {
    userId: number
    isOwner?: boolean
}

export default function PortfolioGrid({ userId, isOwner = false }: PortfolioGridProps) {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchPortfolio()
    }, [userId])

    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`/api/portfolio?userId=${userId}`)
            const data = await res.json()
            setItems(data.items || [])
        } catch (error) {
            console.error('Failed to fetch portfolio:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this portfolio item?')) return

        try {
            const res = await fetch(`/api/portfolio?id=${id}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to delete')
            }

            toast.success('Portfolio item deleted')
            setItems(items.filter((item) => item.id !== id))
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete portfolio item')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            {isOwner && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        + Add Project
                    </button>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <p className="text-gray-400 mb-2">No portfolio items yet</p>
                    {isOwner && (
                        <p className="text-sm text-gray-500 mb-4">
                            Showcase your best work to attract clients
                        </p>
                    )}
                    {isOwner && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Add Your First Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500 transition-all group"
                        >
                            {/* Image */}
                            {item.image_url ? (
                                <div className="relative h-48 bg-gray-700">
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                    <span className="text-4xl">📁</span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                                    {item.title}
                                </h3>

                                {item.description && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}

                                {/* Tech Stack */}
                                {item.tech_stack && item.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.tech_stack.slice(0, 3).map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-md"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {item.tech_stack.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
                                                +{item.tech_stack.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Completion Date */}
                                {item.completion_date && (
                                    <p className="text-xs text-gray-500 mb-3">
                                        Completed: {new Date(item.completion_date).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {item.project_url && (
                                        <a
                                            href={item.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                                        >
                                            View Project
                                        </a>
                                    )}
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Portfolio Modal */}
            {showAddModal && (
                <AddPortfolioModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false)
                        fetchPortfolio()
                    }}
                />
            )}
        </div>
    )
}
