import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, CheckCircle, Clock } from 'lucide-react'

export default async function InstallerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>No autorizado</div>

    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Mis Trabajos</h2>

            {jobs?.map((job) => (
                <Card key={job.id} className="shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{job.title}</CardTitle>
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
                        </div>
                        <CardDescription>{job.client_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.address}</span>
                        </div>
                        {/* 
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            */}
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" variant={job.status === 'pending' ? 'default' : 'outline'}>
                            <Link href={`/installer/jobs/${job.id}`}>
                                {job.status === 'pending' ? 'Gestionar / Subir Fotos' : 'Ver Detalles'}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            {(!jobs || jobs.length === 0) && (
                <div className="text-center py-10 text-gray-500">
                    No tienes trabajos asignados.
                </div>
            )}
        </div>
    )
}
