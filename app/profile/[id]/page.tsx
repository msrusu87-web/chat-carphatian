/**
 * User Profile View Page
 * View user profile with portfolios and reviews
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import PortfolioGrid from '@/components/PortfolioGrid'
import ReviewsDisplay from '@/components/ReviewsDisplay'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProfileViewPage({ params }: PageProps) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = parseInt(id)

    if (isNaN(userId)) {
        notFound()
    }

    // Get user with profile
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            profile: true,
        },
    })

    if (!user) {
        notFound()
    }

    const isOwner = session?.user && (session.user as any).id === id
    const profile = user.profile

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {profile?.avatar_url ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                                    <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {profile?.full_name?.[0] || user.email[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {profile?.full_name || user.email}
                                    </h1>
                                    {profile?.title && (
                                        <p className="text-xl text-purple-400 mb-2">{profile.title}</p>
                                    )}
                                    {profile?.company_name && (
                                        <p className="text-gray-400">
                                            {profile.company_name}
                                            {profile.industry && ` • ${profile.industry}`}
                                        </p>
                                    )}
                                </div>
                                {isOwner && (
                                    <Link
                                        href="/profile/edit"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Edit Profile
                                    </Link>
                                )}
                            </div>

                            {profile?.bio && <p className="text-gray-300 mb-4">{profile.bio}</p>}

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-6 text-sm">
                                {user.role === 'freelancer' && (
                                    <>
                                        {profile?.hourly_rate && (
                                            <div>
                                                <span className="text-gray-400">Hourly Rate: </span>
                                                <span className="text-white font-semibold">${profile.hourly_rate}</span>
                                            </div>
                                        )}
                                        {profile?.experience_years !== null && (
                                            <div>
                                                <span className="text-gray-400">Experience: </span>
                                                <span className="text-white">{profile.experience_years} years</span>
                                            </div>
                                        )}
                                        {profile?.success_rate !== null && (
                                            <div>
                                                <span className="text-gray-400">Success Rate: </span>
                                                <span className="text-green-400 font-semibold">
                                                    {Math.round(Number(profile.success_rate))}%
                                                </span>
                                            </div>
                                        )}
                                        {profile?.total_jobs_completed !== null && profile.total_jobs_completed > 0 && (
                                            <div>
                                                <span className="text-gray-400">Jobs Completed: </span>
                                                <span className="text-white">{profile.total_jobs_completed}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {profile?.availability && user.role === 'freelancer' && (
                                    <div>
                                        <span className="text-gray-400">Availability: </span>
                                        <span className="text-white capitalize">{profile.availability}</span>
                                    </div>
                                )}

                                {profile?.timezone && (
                                    <div>
                                        <span className="text-gray-400">Timezone: </span>
                                        <span className="text-white">{profile.timezone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            {profile?.skills && profile.skills.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-full border border-purple-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-4 mt-4">
                                {profile?.website && (
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        🌐 Website
                                    </a>
                                )}
                                {profile?.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        💼 LinkedIn
                                    </a>
                                )}
                                {profile?.github && (
                                    <a
                                        href={profile.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        💻 GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {user.role === 'freelancer' && (
                        <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile?.education && (
                                <div>
                                    <h3 className="text-white font-semibold mb-2">Education</h3>
                                    <p className="text-gray-300 text-sm whitespace-pre-line">{profile.education}</p>
                                </div>
                            )}
                            {profile?.certifications && (
                                <div>
                                    <h3 className="text-white font-semibold mb-2">Certifications</h3>
                                    <p className="text-gray-300 text-sm whitespace-pre-line">
                                        {profile.certifications}
                                    </p>
                                </div>
                            )}
                            {profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0 && (
                                <div>
                                    <h3 className="text-white font-semibold mb-2">Languages</h3>
                                    <p className="text-gray-300 text-sm">
                                        {profile.languages.map((l: any) => `${l.language} (${l.proficiency})`).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Portfolio Section */}
                {user.role === 'freelancer' && (
                    <div className="mb-6">
                        <PortfolioGrid userId={userId} isOwner={isOwner} />
                    </div>
                )}

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Reviews</h2>
                    <ReviewsDisplay userId={userId} />
                </div>
            </div>
        </div>
    )
}
