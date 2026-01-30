'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createJob } from './actions'

type Installer = {
    id: string
    full_name: string | null
}

export function CreateJobDialog({ installers }: { installers: Installer[] }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            const result = await createJob(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Trabajo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Asignar Nuevo Trabajo</DialogTitle>
                    <DialogDescription>
                        Crea un trabajo y asígnalo a un montador.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título del Trabajo</Label>
                            <Input id="title" name="title" placeholder="Ej: Instalación Rótulo Farmacia" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="clientName">Cliente</Label>
                            <Input id="clientName" name="clientName" placeholder="Nombre del cliente" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" name="address" placeholder="Calle, Ciudad, CP" required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción / Detalles</Label>
                            <Textarea id="description" name="description" placeholder="Instrucciones para el montador..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="assignedTo">Montador</Label>
                                <Select name="assignedTo" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {installers.map((installer) => (
                                            <SelectItem key={installer.id} value={installer.id}>
                                                {installer.full_name || 'Sin nombre'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Precio (€)</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" />
                            </div>
                        </div>

                    </div>
                    {error && (
                        <div className="text-sm text-red-500 mb-4 text-center">
                            {error}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Trabajo
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
