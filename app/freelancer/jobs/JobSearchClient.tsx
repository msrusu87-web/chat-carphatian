'use client'

import JobSearch from '@/components/JobSearch'

interface JobSearchClientProps {
  userId: number
  applicationStatus: Record<number, string>
}

export default function JobSearchClient({ userId, applicationStatus }: JobSearchClientProps) {
  const applicationStatusMap = new Map(
    Object.entries(applicationStatus).map(([k, v]) => [parseInt(k), v])
  )

  return <JobSearch userId={userId} applicationStatusMap={applicationStatusMap} />
}
