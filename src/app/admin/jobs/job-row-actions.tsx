'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { deleteJob } from './actions'
import { revertJobStatus } from '../approvals/actions'
import { RejectionReasonDialog } from '@/components/rejection-reason-dialog'
import { useState } from 'react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function JobRowActions({ job }: { job: any }) {
    const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

    const handleDelete = async () => {
        const result = await deleteJob(job.id)
        if (result.error) {
            toast.error('Error al eliminar: ' + result.error)
        } else {
            toast.success('Trabajo eliminado correctamente')
        }
    }

    const canDelete = job.status === 'pending' || job.status === 'en_revision'

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
                    {canDelete && (
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault()
                                setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:text-red-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar trabajo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el trabajo y toda su evidencia asociada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
