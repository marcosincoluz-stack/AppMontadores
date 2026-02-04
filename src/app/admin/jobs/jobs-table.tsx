'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { JobRowActions } from './job-row-actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { notifyInstallers } from './actions'
import { MessageSquare, CheckSquare, Search, FilterX, Loader2, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface JobsTableProps {
    jobs: any[]
    installers: { id: string, full_name: string }[]
}

export function JobsTable({ jobs, installers }: JobsTableProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())
    const [isNotifying, setIsNotifying] = useState(false)

    // Filter States
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [installerFilter, setInstallerFilter] = useState<string>('all')

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        // Text Search
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            job.title?.toLowerCase().includes(searchLower) ||
            job.client_name?.toLowerCase().includes(searchLower) ||
            job.address?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false

        // Status Filter
        if (statusFilter !== 'all' && job.status !== statusFilter) return false

        // Installer Filter
        if (installerFilter !== 'all') {
            const assignedId = job.assigned_to
            if (installerFilter === 'unassigned') {
                if (assignedId) return false
            } else {
                if (assignedId !== installerFilter) return false
            }
        }

        return true
    })

    // Reset Filters
    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setInstallerFilter('all')
    }

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

    // Toggle all visible jobs (filtered)
    const toggleAll = () => {
        if (selectedJobIds.size === filteredJobs.length && filteredJobs.length > 0) {
            setSelectedJobIds(new Set())
        } else {
            setSelectedJobIds(new Set(filteredJobs.map(j => j.id)))
        }
    }

    // Select all pending jobs
    const selectAllPending = () => {
        const pendingJobs = filteredJobs.filter(j => j.status === 'pending').map(j => j.id)
        if (pendingJobs.length === 0) {
            toast.info('No hay trabajos pendientes en la vista actual')
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
    const allSelected = filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length

    return (
        <div className="space-y-4">
            {/* Toolbar for filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título, cliente, dirección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="en_revision">En Revisión</SelectItem>
                            <SelectItem value="approved">Aprobado</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={installerFilter} onValueChange={setInstallerFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Montador" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los montadores</SelectItem>
                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                            {installers.map(installer => (
                                <SelectItem key={installer.id} value={installer.id}>
                                    {installer.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(searchTerm || statusFilter !== 'all' || installerFilter !== 'all') && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpiar filtros">
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Selection Toolbar */}
            {hasSelection && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg min-h-[3rem] animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground ml-2">
                            {selectedJobIds.size} seleccionados
                        </span>
                    </div>

                    <Button
                        size="sm"
                        onClick={handleBulkNotify}
                        disabled={isNotifying}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {isNotifying ? 'Enviando...' : 'Enviar Notificación'}
                    </Button>
                </div>
            )}

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
                        {filteredJobs?.map((job) => (
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
                                    <Badge variant="outline" className="text-muted-foreground gap-1.5 py-0.5 pr-2.5 pl-1.5 font-normal">
                                        {job.status === 'approved' || job.status === 'paid' ? (
                                            <CheckCircle className="h-3.5 w-3.5 fill-green-500 text-white" />
                                        ) : (
                                            job.status === 'en_revision' ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                            ) : (
                                                <Loader2 className="h-3.5 w-3.5 text-amber-500" />
                                            )
                                        )}
                                        <span className={
                                            job.status === 'pending' ? 'text-amber-600' :
                                                job.status === 'en_revision' ? 'text-blue-600' :
                                                    job.status === 'approved' ? 'text-green-600' :
                                                        job.status === 'paid' ? 'text-gray-600' : ''
                                        }>
                                            {job.status === 'pending' && 'Pendiente'}
                                            {job.status === 'en_revision' && 'En Revisión'}
                                            {job.status === 'approved' && 'Aprobado'}
                                            {job.status === 'paid' && 'Pagado'}
                                        </span>
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {job.amount ? `${job.amount} €` : '-'}
                                </TableCell>
                                <TableCell>
                                    <JobRowActions job={job} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!filteredJobs || filteredJobs.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                    {jobs.length > 0 ? 'No hay resultados para tu búsqueda.' : 'No hay trabajos registrados.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
