import { createClient } from '@/utils/supabase/server'
import { ApprovalsWorkspace } from './approvals-workspace'

export default async function ApprovalsPage() {
    const supabase = await createClient()

    const { data: jobs } = await supabase
        .from('jobs')
        .select(`
      *,
      users!jobs_assigned_to_fkey (full_name),
      evidence (*)
    `)
        .eq('status', 'en_revision')
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 h-full p-6">
            <ApprovalsWorkspace initialJobs={jobs || []} />
        </div>
    )
}
