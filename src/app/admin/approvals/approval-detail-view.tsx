'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RejectionReasonDialog } from '@/components/rejection-reason-dialog'
import { approveJob, rejectJob } from './actions'
import { toast } from 'sonner'
import { CheckCircle, Loader2, XCircle, Camera, FileSignature, AlertCircle, Download, Maximize2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { JobWithDetails } from '@/types/app'

interface ApprovalDetailViewProps {
    job: JobWithDetails
    onProcessed: () => void
}

export function ApprovalDetailView({ job, onProcessed }: ApprovalDetailViewProps) {
    const [isPending, startTransition] = useTransition()
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPreviewImage(null)
            } else if (previewImage && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
                const currentIndex = job.evidence.findIndex((e) => e.url === previewImage)
                if (currentIndex === -1) return

                let newIndex
                if (event.key === 'ArrowRight') {
                    newIndex = (currentIndex + 1) % job.evidence.length
                } else {
                    newIndex = (currentIndex - 1 + job.evidence.length) % job.evidence.length
                }
                setPreviewImage(job.evidence[newIndex].url)
            }
        }

        if (previewImage) {
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [previewImage, job.evidence])

    const photos = job.evidence.filter((e) => e.type === 'photo')
    const signatures = job.evidence.filter((e) => e.type === 'signature')

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
        job.evidence.forEach((e) => window.open(e.url, '_blank'))
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex flex-col border-b bg-background px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold leading-tight tracking-tight">{job.title}</h2>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground">{job.client_name}</span>
                            <span>•</span>
                            <span>{job.address}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Monto Estimado</span>
                        <span className="text-2xl font-bold tabular-nums">
                            {job.amount ? `${job.amount}€` : '-'}
                        </span>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2 py-1">
                            <Camera className="w-3 h-3 text-muted-foreground" />
                            {photos.length} Fotos
                        </Badge>
                        <Badge variant="secondary" className="gap-1 pl-1 pr-2 py-1">
                            <FileSignature className="w-3 h-3 text-muted-foreground" />
                            {signatures.length} Actas
                        </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadAll} className="h-8 gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Descargar Todo
                    </Button>
                </div>
            </div>

            {/* Evidence Grid (Scrollable) */}
            <ScrollArea className="flex-1">
                <div className="p-6 bg-muted/10">
                    {job.evidence.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg bg-background">
                            <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                            <p className="font-medium">No hay evidencias subidas</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24">
                            {job.evidence.map((item) => (
                                <div key={item.id} className="group relative break-inside-avoid overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                                    <div className="aspect-square relative cursor-zoom-in" onClick={() => setPreviewImage(item.url)}>
                                        <img
                                            src={item.url}
                                            alt="Evidencia"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <Badge className={item.type === 'signature' ? 'bg-purple-500/90 hover:bg-purple-600/90' : 'bg-blue-500/90 hover:bg-blue-600/90'} variant="secondary">
                                                {item.type === 'signature' ? 'Acta' : 'Foto'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Actions (Sticky) */}
            <div className="border-t bg-background p-4 shadow-2xl z-20">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 md:gap-4 max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => setIsRejectDialogOpen(true)}
                        className="w-full md:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isPending}
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        Rechazar
                    </Button>

                    <Button
                        onClick={handleApprove}
                        disabled={isPending}
                        className="w-full md:w-auto md:min-w-[200px] h-12 md:h-11 text-base shadow-lg transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Aprobar y Siguiente
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

            {/* Image Preview Overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={previewImage}
                            alt="Vista previa"
                            className="max-w-full max-h-full rounded-md shadow-2xl object-contain animate-in zoom-in-95 duration-200"
                        />
                        <Button
                            className="absolute top-4 right-4 rounded-full w-12 h-12 md:w-10 md:h-10 p-0 shadow-lg z-50"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation()
                                setPreviewImage(null)
                            }}
                        >
                            <XCircle className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
