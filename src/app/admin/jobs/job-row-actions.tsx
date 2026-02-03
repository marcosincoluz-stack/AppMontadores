'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RotateCcw } from 'lucide-react'
import { revertJobStatus } from '../approvals/actions'
import { RejectionReasonDialog } from '@/components/rejection-reason-dialog'
import { useState } from 'react'
import { toast } from 'sonner'

export function JobRowActions({ job }: { job: any }) {
    const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)

    const handleRevert = async (reason: string) => {
        const result = await revertJobStatus(job.id, reason)
        if (result.error) {
            toast.error('Error al revertir: ' + result.error)
        } else {
            const message = reason
                ? 'Trabajo devuelto al instalador para cambios'
                : 'Trabajo revertido a revisión interna'
            toast.success(message)
            setIsRevertDialogOpen(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    {job.status === 'approved' && (
                        <DropdownMenuItem
                            onClick={() => setIsRevertDialogOpen(true)}
                            className="text-amber-600 focus:text-amber-700"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Revertir / Corregir
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem disabled>
                        Ver Detalles (Próximamente)
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <RejectionReasonDialog
                open={isRevertDialogOpen}
                onOpenChange={setIsRevertDialogOpen}
                onConfirm={handleRevert}
                title="Revertir Trabajo"
                confirmText="Confirmar Reversión"
            />
        </>
    )
}
