'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox' // We'll assume this exists or use native for now if it doesn't
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobRowActions } from './job-row-actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { notifyInstallers } from './actions'
import { MessageSquare, CheckSquare } from 'lucide-react'

interface JobsTableProps {
    jobs: any[]
}

export function JobsTable({ jobs }: JobsTableProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
    const [isNotifying, setIsNotifying] = useState(false)

    // Helper to toggle a single job
    const toggleJob = (jobId: string) => {
        const newSelected = new Set(selectedJobIds)
        if (newSelected.has(jobId)) {
            newSelected.delete(jobId)
        } else {
            newSelected.add(jobId)
        }
        setSelectedJobIds(newSelected)
    }

    // Toggle all visible jobs
    const toggleAll = () => {
        if (selectedJobIds.size === jobs.length) {
            setSelectedJobIds(new Set())
        } else {
            setSelectedJobIds(new Set(jobs.map(j => j.id)))
        }
    }

    // Select all pending jobs
    const selectAllPending = () => {
        const pendingJobs = jobs.filter(j => j.status === 'pending').map(j => j.id)
        if (pendingJobs.length === 0) {
            toast.info('No hay trabajos pendientes para seleccionar')
            return
        }
        setSelectedJobIds(new Set(pendingJobs))
        toast.success(`Seleccionados ${pendingJobs.length} trabajos pendientes`)
    }

    const handleBulkNotify = async () => {
        if (selectedJobIds.size === 0) return

        setIsNotifying(true)
        try {
            const result = await notifyInstallers(Array.from(selectedJobIds))
            if (result.success) {
                toast.success(`Notificación enviada a ${result.count} montadores (Simulacro)`)
                setSelectedJobIds(new Set()) // Clear selection
            }
        } catch (error) {
            toast.error('Error al enviar notificaciones')
        } finally {
            setIsNotifying(false)
        }
    }

    const hasSelection = selectedJobIds.size > 0
    const allSelected = jobs.length > 0 && selectedJobIds.size === jobs.length

    return (
        <div className="space-y-4">
            {/* Toolbar for selections */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg min-h-[3rem] transition-all">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllPending}
                        className="text-xs h-8"
                    >
                        <CheckSquare className="w-3.5 h-3.5 mr-2" />
                        Seleccionar todos los Pendientes
                    </Button>
                    {hasSelection && (
                        <span className="text-sm font-medium text-muted-foreground ml-2">
                            {selectedJobIds.size} seleccionados
                        </span>
                    )}
                </div>

                {hasSelection && (
                    <Button
                        size="sm"
                        onClick={handleBulkNotify}
                        disabled={isNotifying}
                        className="animate-in fade-in slide-in-from-right-5"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {isNotifying ? 'Enviando...' : 'Enviar Notificación (WhatsApp)'}
                    </Button>
                )}
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleAll}
                                    aria-label="Seleccionar todo"
                                />
                            </TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs?.map((job) => (
                            <TableRow
                                key={job.id}
                                className={selectedJobIds.has(job.id) ? "bg-muted/50" : ""}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedJobIds.has(job.id)}
                                        onCheckedChange={() => toggleJob(job.id)}
                                        aria-label={`Seleccionar ${job.title}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.client_name}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={job.address}>{job.address}</TableCell>
                                <TableCell>
                                    {(job.users as any)?.full_name || 'Sin asignar'}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${job.status === 'en_revision' ? 'bg-blue-100 text-blue-800' : ''}
                    ${job.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${job.status === 'paid' ? 'bg-gray-100 text-gray-800' : ''}
                   `}>
                                        {job.status === 'pending' && 'Pendiente'}
                                        {job.status === 'en_revision' && 'En Revisión'}
                                        {job.status === 'approved' && 'Aprobado'}
                                        {job.status === 'paid' && 'Pagado'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {job.amount ? `${job.amount} €` : '-'}
                                </TableCell>
                                <TableCell>
                                    <JobRowActions job={job} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!jobs || jobs.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
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
