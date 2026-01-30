'use client'

import { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { approveJob } from './actions'
import { toast } from 'sonner'
import { CheckCircle, Loader2, Download } from 'lucide-react'

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

    const handleDownload = () => {
        // Simple download: open all URLs?
        // Or Zip? Zip requires JS library like jszip.
        // For MVP: Open each in new tab or just download first.
        // Let's just log for now or open.
        job.evidence.forEach(e => window.open(e.url, '_blank'))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <p className="text-sm text-gray-500">{job.client_name} - {job.address}</p>
                <p className="text-xs text-blue-600">Montador: {(job.users as any)?.full_name}</p>
            </CardHeader>
            <CardContent>
                {job.evidence.length > 0 ? (
                    <Carousel className="w-full max-w-xs mx-auto">
                        <CarouselContent>
                            {job.evidence.map((item) => (
                                <CarouselItem key={item.id}>
                                    <div className="p-1">
                                        <Card>
                                            <CardContent className="flex aspect-square items-center justify-center p-0">
                                                <img src={item.url} alt="Evidence" className="object-cover w-full h-full rounded-md" />
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
                <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Aprobar y Pagar
                </Button>
            </CardFooter>
        </Card>
    )
}
