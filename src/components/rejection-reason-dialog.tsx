'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, AlertTriangle } from 'lucide-react'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string) => Promise<void>
    title?: string
    confirmText?: string
    isPending?: boolean
}

const COMMON_REASONS = [
    'Falta foto del acta firmada',
    'Falta foto del montaje',
    'La foto del acta no es legible',
    'Fotos borrosas o insuficientes',
    'Falta firma del cliente',
]

export function RejectionReasonDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Solicitar Cambios',
    confirmText = 'Enviar Correcciones',
    isPending = false
}: Props) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [customReason, setCustomReason] = useState('')

    const toggleReason = (reason: string) => {
        setSelectedReasons(prev =>
            prev.includes(reason)
                ? prev.filter(r => r !== reason)
                : [...prev, reason]
        )
    }

    const finalReason = [
        ...selectedReasons,
        customReason.trim()
    ].filter(Boolean).join('. ')

    const handleConfirm = async () => {
        if (!finalReason) return
        await onConfirm(finalReason)
        // Reset state after success (the parent might close the dialog, but good practice)
        setSelectedReasons([])
        setCustomReason('')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Indica los motivos por los que el trabajo necesita revisión.
                        El montador recibirá estos comentarios para realizar las correcciones.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Motivos comunes:</Label>
                        <div className="grid gap-2">
                            {COMMON_REASONS.map((reason) => (
                                <div key={reason} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={reason}
                                        checked={selectedReasons.includes(reason)}
                                        onCheckedChange={() => toggleReason(reason)}
                                    />
                                    <Label
                                        htmlFor={reason}
                                        className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {reason}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-reason">Otro motivo / Comentarios adicionales:</Label>
                        <Textarea
                            id="custom-reason"
                            placeholder="Ej: La foto del cuadro eléctrico está muy oscura..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {finalReason && (
                        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm text-amber-900">
                            <span className="font-semibold flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3 w-3" /> Vista previa del mensaje:
                            </span>
                            "{finalReason}"
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" type="button" disabled={isPending}>Cancelar</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isPending || !finalReason}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
