'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { RejectionReasonDialog } from '@/components/rejection-reason-dialog'
import { approveJob, rejectJob } from './actions'
import { toast } from 'sonner'
import { CheckCircle, Loader2, XCircle, Camera, FileSignature, AlertCircle, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ApprovalDetailViewProps {
    job: any
    onProcessed: () => void
}

export function ApprovalDetailView({ job, onProcessed }: ApprovalDetailViewProps) {
    const [isPending, startTransition] = useTransition()
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

    const photos = job.evidence.filter((e: any) => e.type === 'photo')
    const signatures = job.evidence.filter((e: any) => e.type === 'signature')

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveJob(job.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Trabajo aprobado correctemente')
                onProcessed()
            }
        })
    }

    const handleReject = (reason: string) => {
        return new Promise<void>((resolve) => {
            startTransition(async () => {
                const result = await rejectJob(job.id, reason)
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success('Trabajo rechazado')
                    setIsRejectDialogOpen(false)
                    onProcessed()
                }
                resolve()
            })
        })
    }

    const handleDownloadAll = () => {
        job.evidence.forEach((e: any) => window.open(e.url, '_blank'))
    }

    const [previewImage, setPreviewImage] = useState<string | null>(null)

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b bg-muted/10">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">{job.title}</h2>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <span>{job.client_name}</span>
                            <span>•</span>
                            <span>{job.address}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">Monto estimado</div>
                        <div className="text-xl font-bold">{job.amount ? `${job.amount} €` : '-'}</div>
                    </div>
                </div>

                <div className="flex gap-4 mt-4 text-sm">
                    <Badge variant="outline" className="gap-1 pl-1">
                        <Camera className="w-3 h-3" />
                        {photos.length} Fotos
                    </Badge>
                    <Badge variant="outline" className="gap-1 pl-1">
                        <FileSignature className="w-3 h-3" />
                        {signatures.length} Actas
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleDownloadAll} className="h-6 text-xs ml-auto">
                        <Download className="w-3 h-3 mr-1" />
                        Abrir todas
                    </Button>
                </div>
            </div>

            {/* Evidence Grid (Scrollable) */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
                {job.evidence.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        No hay evidencias subidas
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {job.evidence.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                <CardContent className="p-0 relative aspect-square">
                                    <img
                                        src={item.url}
                                        alt="Evidencia"
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                        onClick={() => setPreviewImage(item.url)}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge className={item.type === 'signature' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                                            {item.type === 'signature' ? 'Acta' : 'Foto'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions (Sticky) */}
            <div className="p-4 border-t bg-white flex justify-between items-center gap-4 shadow-lg z-10">
                <Button
                    variant="ghost"
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isPending}
                >
                    <XCircle className="w-5 h-5 mr-2" />
                    Rechazar Trabajo
                </Button>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground italic hidden sm:inline">
                        Se abrirá el siguiente automáticamente
                    </span>
                    <Button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="bg-green-600 hover:bg-green-700 min-w-[150px] h-12 text-lg shadow-green-200 shadow-lg"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Aprobar Trabajo
                    </Button>
                </div>
            </div>

            <RejectionReasonDialog
                open={isRejectDialogOpen}
                onOpenChange={setIsRejectDialogOpen}
                onConfirm={handleReject}
                title={`Rechazar: ${job.title}`}
                confirmText="Confirmar Rechazo"
                isPending={isPending}
            />

            {/* Image Preview Dialog */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img
                            src={previewImage}
                            alt="Vista previa"
                            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        />
                        <Button
                            className="absolute top-[-20px] right-[-20px] rounded-full"
                            size="icon"
                            variant="destructive"
                            onClick={() => setPreviewImage(null)}
                        >
                            <XCircle className="w-6 h-6" />
                        </Button>
                        <p className="text-white text-center mt-2 text-sm bg-black/50 px-3 py-1 rounded-full mx-auto w-fit">
                            Click fuera para cerrar
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
