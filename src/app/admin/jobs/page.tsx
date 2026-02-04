import { createClient } from '@/utils/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { CreateJobDialog } from './create-job-dialog'
import { JobsTable } from './jobs-table'

export default async function AdminJobsPage() {
    const supabase = await createClient()

    // Fetch jobs with assigned user name
    const { data: jobs } = await supabase
        .from('jobs')
        .select(`
      *,
      users!jobs_assigned_to_fkey (
        full_name
      )
    `)
        .order('created_at', { ascending: false })

    // Fetch installers for the creating dialog
    const { data: installers } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'installer')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Trabajos</h2>
                <CreateJobDialog installers={installers || []} />
            </div>

            <div className="border rounded-md bg-white">
                <JobsTable jobs={jobs || []} />
            </div>
        </div>
    )
}
