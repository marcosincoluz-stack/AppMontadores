import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { LogOut, User, Mail, ShieldCheck, Briefcase } from 'lucide-react'
import { signOut } from '@/app/login/actions'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user role/data if available in a public table
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    // Get basic stats (optional, but nice for "polishing")
    const { count: approvedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'approved')

    const { count: pendingCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'pending')

    const userInitials = user.email?.substring(0, 2).toUpperCase() || 'U'

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                        {userInitials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tu cuenta y sesión</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Información Personal
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                        </div>
                        <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Rol</span>
                        </div>
                        <span className="text-sm font-medium capitalize">
                            {userData?.role === 'installer' ? 'Montador' : (userData?.role || 'Montador')}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        Resumen de Actividad
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg text-center border">
                            <p className="text-2xl font-bold text-slate-900">{pendingCount || 0}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Pendientes</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg text-center border">
                            <p className="text-2xl font-bold text-slate-900">{approvedCount || 0}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Aprobados</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form action={signOut} className="pt-4">
                <Button variant="destructive" className="w-full flex items-center gap-2 h-12 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground pt-8">
                App Montadores v1.0.0
            </p>
        </div>
    )
}
