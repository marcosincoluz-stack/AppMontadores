import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadEvidenceForm } from './upload-evidence-form'
import { Badge } from '@/components/ui/badge'
import { CompleteJobButton } from './complete-job-button'
import { ArrowLeft, Camera, FileSignature, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

    if (!job) {
        notFound()
    }

    // Fetch evidence data server-side (proper auth context)
    const { data: evidence } = await supabase
        .from('evidence')
        .select('id, type, url')
        .eq('job_id', id)
        .order('uploaded_at', { ascending: false })

    const photos = evidence?.filter(e => e.type === 'photo') ?? []
    const signatures = evidence?.filter(e => e.type === 'signature') ?? []
    const photoCount = photos.length
    const signatureCount = signatures.length

    return (
        <div className="space-y-6">
            <Link href="/installer" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Volver a mis trabajos
            </Link>

            {job.rejection_reason && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Trabajo rechazado</p>
                        <p className="text-sm mt-1">{job.rejection_reason}</p>
                        <p className="text-xs mt-2 text-red-600">Por favor, corrige las evidencias indicadas y vuelve a enviar.</p>
                    </div>
                </div>
            )}

            <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">{job.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-4 px-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</h3>
                            <p className="text-sm font-medium">{job.client_name}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dirección</h3>
                            <p className="text-sm line-clamp-2">{job.address}</p>
                        </div>
                    </div>
                    {job.description && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{job.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Fotos del Trabajo
                            <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${photoCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {photoCount} subida{photoCount !== 1 ? 's' : ''}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Sube fotos que evidencien el trabajo realizado.</p>
                        <UploadEvidenceForm
                            jobId={job.id}
                            jobStatus={job.status || 'pending'}
                            title="Añadir Foto"
                            evidenceType="photo"
                        />
                        {photos.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {photos.map((photo) => (
                                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                        <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <FileSignature className="h-5 w-5" />
                            Acta Firmada
                            <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${signatureCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {signatureCount} subida{signatureCount !== 1 ? 's' : ''}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Obligatorio: Sube una foto del acta firmada por el cliente.</p>
                        <UploadEvidenceForm
                            jobId={job.id}
                            jobStatus={job.status || 'pending'}
                            title="Añadir Acta Firmada"
                            evidenceType="signature"
                        />
                        {signatures.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {signatures.map((sig) => (
                                    <div key={sig.id} className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                                        <img src={sig.url} alt="Acta" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {job.status === 'pending' && (
                    <div className="pt-4 border-t">
                        <CompleteJobButton
                            jobId={job.id}
                            initialPhotoCount={photoCount}
                            initialSignatureCount={signatureCount}
                        />
                    </div>
                )}
            </div>
        </div >
    )
}
