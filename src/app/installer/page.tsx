import { createClient } from '@/utils/supabase/server'
import { InstallerJobsList } from './jobs-list'

export default async function InstallerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>No autorizado</div>

    let { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', user.id)

    if (!jobs) jobs = []

    // Initial Server Sorting (Fallback)
    jobs.sort((a, b) => {
        const aRejected = a.status === 'pending' && a.rejection_reason
        const bRejected = b.status === 'pending' && b.rejection_reason

        if (aRejected && !bRejected) return -1
        if (!aRejected && bRejected) return 1
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (a.status !== 'pending' && b.status === 'pending') return 1
        if (a.status === 'en_revision' && b.status !== 'en_revision') return -1
        if (a.status !== 'en_revision' && b.status === 'en_revision') return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const rejectedCount = jobs.filter(j => j.status === 'pending' && j.rejection_reason).length

    return (
        <InstallerJobsList initialJobs={jobs} rejectedCount={rejectedCount} userId={user.id} />
    )
}
