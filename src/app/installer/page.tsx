import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, AlertCircle, ChevronRight, Clock, CheckCircle } from 'lucide-react'
import { IncidentStartupDialog } from '@/components/incident-startup-dialog'

export default async function InstallerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>No autorizado</div>

    let { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', user.id)

    if (!jobs) jobs = []

    // Custom Sorting Logic
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
        <div className="space-y-3 p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold tracking-tight">Mis Trabajos</h2>

            <IncidentStartupDialog rejectedJobCount={rejectedCount} />

            <div className="space-y-2">
                {jobs.map((job) => {
                    const isRejected = job.status === 'pending' && job.rejection_reason

                    return (
                        <Link
                            href={`/installer/jobs/${job.id}`}
                            key={job.id}
                            className="block group"
                        >
                            <Card className={`relative overflow-hidden transition-colors hover:bg-accent/50
                                ${isRejected ? 'border-destructive/50' : ''}
                            `}>
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-sm truncate leading-none">
                                                {job.title}
                                            </h3>

                                            {isRejected ? (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px] tracking-wide uppercase">
                                                    Incidencia
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className={`h-5 px-1.5 text-[10px] font-normal tracking-wide uppercase border-0
                                                    ${job.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}
                                                    ${job.status === 'en_revision' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                                                    ${job.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                    ${job.status === 'paid' ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' : ''}
                                                `}>
                                                    {job.status === 'pending' && 'Pendiente'}
                                                    {job.status === 'en_revision' && 'Revisión'}
                                                    {job.status === 'approved' && 'Aprobado'}
                                                    {job.status === 'paid' && 'Pagado'}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground truncate">
                                            {job.client_name}
                                        </p>

                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="truncate">{job.address}</span>
                                        </div>

                                        {isRejected && (
                                            <div className="mt-2 text-xs text-destructive font-medium flex items-start gap-1">
                                                <AlertCircle className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
                                                <span className="line-clamp-1">{job.rejection_reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 self-center">
                                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full
                                            ${job.status === 'paid'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                                            }
                                        `}>
                                            {job.status === 'paid' ? (
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <Clock className="h-3.5 w-3.5" />
                                            )}
                                            <span>
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(job.amount || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 transition-colors" />
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {(!jobs || jobs.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                    <div className="bg-muted p-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">Todo al día</p>
                        <p className="text-xs">No tienes trabajos asignados.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
