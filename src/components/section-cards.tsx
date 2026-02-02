import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, Briefcase, Users } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

// We make this an async server component to fetch its own data!
export async function SectionCards() {
    const supabase = await createClient()

    // Fetch counts
    // Note: For real efficiency we might want to do this in the page pass it down, 
    // but for "Drop-in" blocks, fetching inside is common in RSC.

    const { count: pendingCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'en_revision')

    const { count: activeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'installer')


    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revisiones</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Pendientes de aprobación</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Activos</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCount || 0}</div>
                    <p className="text-xs text-muted-foreground">En curso</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Equipo</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{usersCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Montadores registrados</p>
                </CardContent>
            </Card>
        </div>
    )
}
