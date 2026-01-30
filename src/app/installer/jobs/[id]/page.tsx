import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadEvidenceForm } from './upload-evidence-form'
import { Badge } from '@/components/ui/badge'
import { CompleteJobButton } from './complete-job-button'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <Badge variant="outline" className="w-fit mt-2">{job.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500">Cliente</h3>
                        <p>{job.client_name}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500">Dirección</h3>
                        <p>{job.address}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500">Descripción</h3>
                        <p className="whitespace-pre-wrap">{job.description || 'Sin descripción'}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-bold">Evidencias del Trabajo</h3>
                {/* Upload Form Component -Client Side- */}
                <UploadEvidenceForm jobId={job.id} jobStatus={job.status || 'pending'} />

                {job.status === 'pending' && (
                    <div className="pt-4 border-t">
                        <CompleteJobButton jobId={job.id} />
                    </div>
                )}
            </div>
        </div>
    )
}
