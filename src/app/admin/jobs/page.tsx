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
import { Badge } from '@/components/ui/badge' // Need to add badge component? Or just style it manually.

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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs?.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.client_name}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={job.address}>{job.address}</TableCell>
                                <TableCell>
                                    {(job.users as any)?.full_name || 'Sin asignar'}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${job.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    ${job.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${job.status === 'paid' ? 'bg-gray-100 text-gray-800' : ''}
                   `}>
                                        {job.status === 'pending' && 'Pendiente'}
                                        {job.status === 'completed' && 'Completado'}
                                        {job.status === 'approved' && 'Aprobado'}
                                        {job.status === 'paid' && 'Pagado'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {job.amount ? `${job.amount} €` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!jobs || jobs.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                    No hay trabajos registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
