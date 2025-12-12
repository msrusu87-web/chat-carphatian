/**
 * Enhanced Profile Edit Page
 * Edit professional details, social links, and experience
 * Built by Carphatian
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function EditProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        bio: '',
        title: '',
        skills: [] as string[],
        hourly_rate: '',
        experience_years: '',
        education: '',
        certifications: '',
        availability: 'full-time',
        timezone: '',
        company_name: '',
        company_size: '',
        industry: '',
        website: '',
        linkedin: '',
        github: '',
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchProfile()
        }
    }, [status])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            const data = await res.json()

            setProfile({
                full_name: data.full_name || '',
                bio: data.bio || '',
                title: data.title || '',
                skills: data.skills || [],
                hourly_rate: data.hourly_rate?.toString() || '',
                experience_years: data.experience_years?.toString() || '',
                education: data.education || '',
                certifications: data.certifications || '',
                availability: data.availability || 'full-time',
                timezone: data.timezone || '',
                company_name: data.company_name || '',
                company_size: data.company_size || '',
                industry: data.industry || '',
                website: data.website || '',
                linkedin: data.linkedin || '',
                github: data.github || '',
            })
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...profile,
                    hourly_rate: profile.hourly_rate ? parseFloat(profile.hourly_rate) : null,
                    experience_years: profile.experience_years
                        ? parseInt(profile.experience_years)
                        : null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile')
            }

            toast.success('Profile updated successfully!')

            // Generate embedding for the updated profile if it has bio
            if (profile.bio || profile.skills.length > 0) {
                const profileText = [
                    profile.bio,
                    profile.title,
                    profile.skills.join(', '),
                    profile.experience_years ? `${profile.experience_years} years experience` : '',
                ]
                    .filter(Boolean)
                    .join('. ')

                await fetch('/api/ai/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: profileText, userId: session?.user?.id }),
                })
            }

            router.push('/profile')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
        setProfile({ ...profile, skills })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    const userRole = (session?.user as any)?.role

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Professional Title</label>
                                <input
                                    type="text"
                                    value={profile.title}
                                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                    placeholder="e.g., Full Stack Developer, UI/UX Designer"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    rows={4}
                                    placeholder="Tell us about yourself, your experience, and what you do best..."
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        {/* Freelancer-specific fields */}
                        {userRole === 'freelancer' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                                    Professional Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Hourly Rate ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.hourly_rate}
                                            onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                                            placeholder="50"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.experience_years}
                                            onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                                            placeholder="5"
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Skills (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.skills.join(', ')}
                                        onChange={handleSkillsChange}
                                        placeholder="React, Node.js, TypeScript, PostgreSQL"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
                                    <textarea
                                        value={profile.education}
                                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                                        rows={3}
                                        placeholder="B.S. Computer Science, University of..."
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Certifications
                                    </label>
                                    <textarea
                                        value={profile.certifications}
                                        onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                                        rows={3}
                                        placeholder="AWS Certified Developer, Google Cloud Professional..."
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                                        <select
                                            value={profile.availability}
                                            onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="full-time">Full-time</option>
                                            <option value="part-time">Part-time</option>
                                            <option value="contract">Contract</option>
                                            <option value="hourly">Hourly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                                        <input
                                            type="text"
                                            value={profile.timezone}
                                            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                            placeholder="America/New_York"
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Client-specific fields */}
                        {userRole === 'client' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                                    Company Information
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        value={profile.company_name}
                                        onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                                        <select
                                            value={profile.company_size}
                                            onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="500+">500+ employees</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                                        <input
                                            type="text"
                                            value={profile.industry}
                                            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                            placeholder="Technology, Finance, Healthcare..."
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                                Social Links
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                <input
                                    type="url"
                                    value={profile.website}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={profile.linkedin}
                                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                                    <input
                                        type="url"
                                        value={profile.github}
                                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                        placeholder="https://github.com/yourusername"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
