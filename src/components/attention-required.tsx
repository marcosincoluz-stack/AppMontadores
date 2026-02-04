import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, UserX } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function AttentionRequired() {
    const supabase = await createClient()

    // Get jobs in revision (oldest first)
    const { data: revisionJobs } = await supabase
        .from('jobs')
        .select('id, title, client_name, updated_at')
        .eq('status', 'en_revision')
        .order('updated_at', { ascending: true })
        .limit(3)

    // Get unassigned jobs
    const { data: unassignedJobs } = await supabase
        .from('jobs')
        .select('id, title, client_name, created_at')
        .is('assigned_to', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(2)

    const items = [
        ...(revisionJobs || []).map(job => ({
            id: job.id,
            title: job.title,
            subtitle: job.client_name,
            type: 'revision' as const,
            date: job.updated_at,
            icon: Clock,
            badge: 'En revisión',
            badgeVariant: 'destructive' as const
        })),
        ...(unassignedJobs || []).map(job => ({
            id: job.id,
            title: job.title,
            subtitle: job.client_name,
            type: 'unassigned' as const,
            date: job.created_at,
            icon: UserX,
            badge: 'Sin asignar',
            badgeVariant: 'secondary' as const
        }))
    ].slice(0, 5)

    if (items.length === 0) {
        return (
            <Card className="mx-4 lg:mx-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-green-500" />
                        Todo en orden
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No hay trabajos que requieran atención inmediata.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-4 lg:mx-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Requiere tu atención
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={item.type === 'revision' ? '/admin/approvals' : `/admin/jobs?id=${item.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: es })}
                            </span>
                            <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                        </div>
                    </Link>
                ))}
                <Link
                    href="/admin/jobs"
                    className="block text-center text-sm text-primary hover:underline pt-2"
                >
                    Ver todos los trabajos →
                </Link>
            </CardContent>
        </Card>
    )
}
