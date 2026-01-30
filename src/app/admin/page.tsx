import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Briefcase, FileCheck } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch counts
    const { count: pendingCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

    const { count: activeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/approvals">
                    <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revisiones Pendientes</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Trabajos esperando aprobación
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/jobs">
                    <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trabajos Activos</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeCount || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                En proceso por montadores
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/users">
                    <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Montadores</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                Gestionar equipo
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
