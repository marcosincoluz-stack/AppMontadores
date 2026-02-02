import { createClient } from '@/utils/supabase/server'
import { JobApprovalCard } from './job-approval-card'

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
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Revisiones Pendientes</h2>

            {(!jobs || jobs.length === 0) && (
                <div className="text-center py-20 text-gray-500 bg-white rounded shadow">
                    <p>No hay trabajos pendientes de revisión.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs?.map((job) => (
                    <JobApprovalCard key={job.id} job={job as any} />
                ))}
            </div>
        </div>
    )
}
