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
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Revisiones Pendientes</h2>
            </div>

            <ApprovalsWorkspace initialJobs={jobs || []} />
        </div>
    )
}
