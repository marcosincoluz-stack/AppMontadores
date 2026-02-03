'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function IncidentStartupDialog({ rejectedJobCount }: { rejectedJobCount: number }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (rejectedJobCount > 0) {
            setOpen(true)
        }
    }, [rejectedJobCount])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md border-amber-200 bg-amber-50">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <AlertTriangle className="h-6 w-6" />
                        <DialogTitle className="text-amber-900">¡Atención requerida!</DialogTitle>
                    </div>
                    <DialogDescription className="text-amber-800">
                        Tienes <strong>{rejectedJobCount} trabajo{rejectedJobCount !== 1 ? 's' : ''}</strong> devuelto{rejectedJobCount !== 1 ? 's' : ''} con incidencias.
                        <br /><br />
                        Por favor, revisa los motivos indicados y realiza las correcciones necesarias lo antes posible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={() => setOpen(false)}
                        className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                    >
                        Entendido, voy a revisarlos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
