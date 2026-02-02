'use client'

import { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { approveJob, rejectJob } from './actions'
import { toast } from 'sonner'
import { CheckCircle, Loader2, Download, XCircle, Camera, FileSignature } from 'lucide-react'

type Evidence = {
    id: string
    url: string
    type: 'photo' | 'signature'
}

type Job = {
    id: string
    title: string
    client_name: string
    address: string
    evidence: Evidence[]
    users: { full_name: string | null } | null
}

export function JobApprovalCard({ job }: { job: Job }) {
    const [isPending, startTransition] = useTransition()
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    const photos = job.evidence.filter(e => e.type === 'photo')
    const signatures = job.evidence.filter(e => e.type === 'signature')

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveJob(job.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Trabajo aprobado correctamente')
            }
        })
    }

    const handleReject = () => {
        startTransition(async () => {
            const result = await rejectJob(job.id, rejectReason)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Trabajo rechazado. El montador ha sido notificado.')
                setIsRejectDialogOpen(false)
                setRejectReason('')
            }
        })
    }

    const handleDownload = () => {
        job.evidence.forEach(e => window.open(e.url, '_blank'))
    }

    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-gray-500">{job.client_name} - {job.address}</p>
                    <p className="text-xs text-blue-600">Montador: {(job.users as any)?.full_name}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1 text-gray-600">
                            <Camera className="h-3 w-3" /> {photos.length} fotos
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                            <FileSignature className="h-3 w-3" /> {signatures.length} actas
                        </span>
                    </div>
                    {job.evidence.length > 0 ? (
                        <Carousel className="w-full max-w-xs mx-auto">
                            <CarouselContent>
                                {job.evidence.map((item) => (
                                    <CarouselItem key={item.id}>
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                                    <img src={item.url} alt="Evidence" className="object-cover w-full h-full rounded-md" />
                                                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${item.type === 'signature' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {item.type === 'signature' ? 'Acta' : 'Foto'}
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <div className="text-center py-4 bg-gray-100 rounded text-gray-500">
                            Sin evidencias subidas
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={job.evidence.length === 0}>
                        <Download className="h-4 w-4 mr-1" /> Descargar
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsRejectDialogOpen(true)}
                            disabled={isPending}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={handleApprove}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                            Aprobar
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar trabajo: {job.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Motivo del rechazo</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Ej: Falta foto del cableado, acta ilegible..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isPending || !rejectReason.trim()}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Confirmar Rechazo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
