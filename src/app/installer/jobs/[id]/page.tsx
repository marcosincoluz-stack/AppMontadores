import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadEvidenceForm } from './upload-evidence-form'
import { Badge } from '@/components/ui/badge'
import { JobStatusFooter } from './job-status-footer'
import { ArrowLeft, Camera, FileSignature, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { EvidenceCard } from './evidence-card'

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
        <div className="space-y-6 pb-24">
            <Link href="/installer" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Volver a mis trabajos
            </Link>

            {job.rejection_reason && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Trabajo rechazado</AlertTitle>
                    <AlertDescription className="mt-2 text-sm">
                        <p className="font-medium text-xs uppercase tracking-wide opacity-80 mb-1">Motivos:</p>
                        <ul className="list-disc list-inside space-y-1 mb-3">
                            {job.rejection_reason.split('.').filter((r: string) => r.trim().length > 0).map((reason: string, i: number) => (
                                <li key={i} className="leading-snug">
                                    {reason.trim()}
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2 text-xs font-semibold bg-destructive/10 p-2 rounded text-destructive-foreground">
                            <Info className="h-4 w-4 shrink-0" />
                            <span>Por favor, corrige las evidencias indicadas y vuelve a enviar.</span>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <h1 className="text-xl font-bold leading-tight line-clamp-2">{job.title}</h1>
                    <Badge variant="outline" className={`text-[10px] h-5 font-normal tracking-wide uppercase border-0 shrink-0
                        ${job.status === 'pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 font-bold' : ''}
                        ${job.status === 'en_revision' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                        ${job.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                        ${job.status === 'paid' ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' : ''}
                    `}>
                        {job.status === 'pending' && 'INCOMPLETO'}
                        {job.status === 'en_revision' && 'En Revisión'}
                        {job.status === 'approved' && 'Aprobado'}
                        {job.status === 'paid' && 'Pagado'}
                    </Badge>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-base">
                    <span className="text-muted-foreground font-medium text-xs uppercase self-baseline pt-1">Cliente:</span>
                    <span className="font-medium truncate">{job.client_name}</span>

                    <span className="text-muted-foreground font-medium text-xs uppercase self-baseline pt-1">Dirección:</span>
                    <span className="text-muted-foreground leading-snug">{job.address}</span>
                </div>

                {job.description && (
                    <div className="pt-3 mt-2 border-t text-sm text-muted-foreground">
                        <p className="">{job.description}</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Photos Column */}
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold flex items-center gap-1.5">
                                    <Camera className="h-4 w-4" />
                                    Fotos
                                    <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${photoCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {photoCount}
                                    </span>
                                </h3>
                                <UploadEvidenceForm
                                    jobId={job.id}
                                    jobStatus={job.status || 'pending'}
                                    title="Añadir Foto"
                                    evidenceType="photo"
                                />
                            </div>

                            {photos.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                    {photos.map((photo) => (
                                        <EvidenceCard
                                            key={photo.id}
                                            id={photo.id}
                                            url={photo.url}
                                            jobId={job.id}
                                            isPending={job.status === 'pending'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Signature Column */}
                        <div className="space-y-3 border-l pl-3 border-gray-100">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold flex items-center gap-1.5">
                                    <FileSignature className="h-4 w-4" />
                                    Acta
                                    <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${signatureCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {signatureCount}
                                    </span>
                                </h3>
                                <UploadEvidenceForm
                                    jobId={job.id}
                                    jobStatus={job.status || 'pending'}
                                    title="Añadir Acta"
                                    evidenceType="signature"
                                />
                            </div>

                            {signatures.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                    {signatures.map((sig) => (
                                        <EvidenceCard
                                            key={sig.id}
                                            id={sig.id}
                                            url={sig.url}
                                            jobId={job.id}
                                            isPending={job.status === 'pending'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Sticky Footer Status Bar - sits above BottomNav (h-16) */}
            {job.status === 'pending' && (
                <div className="fixed bottom-16 left-0 right-0 z-[60] pb-safe">
                    <JobStatusFooter
                        jobId={job.id}
                        initialPhotoCount={photoCount}
                        initialSignatureCount={signatureCount}
                    />
                </div>
            )}
        </div>
    )
}
