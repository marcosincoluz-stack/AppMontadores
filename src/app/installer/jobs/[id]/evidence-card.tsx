'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteEvidence } from '../actions'

import { useRouter } from 'next/navigation'

interface EvidenceCardProps {
    id: string
    url: string
    jobId: string
    isPending: boolean
}

export function EvidenceCard({ id, url, jobId, isPending }: EvidenceCardProps) {
    const [isDeleting, startTransition] = useTransition()
    const [isVisible, setIsVisible] = useState(true)
    const router = useRouter()

    const handleDelete = () => {
        if (!isPending) return

        startTransition(async () => {
            const result = await deleteEvidence(id, url, jobId)
            if (result.error) {
                toast.error('Error al borrar: ' + result.error)
            } else {
                toast.success('Foto eliminada')
                setIsVisible(false) // Optimistic update
                router.refresh()
            }
        })
    }

    if (!isVisible) return null

    return (
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
            <img
                src={url}
                alt="Evidencia"
                className={`w-full h-full object-cover transition-opacity ${isDeleting ? 'opacity-50' : ''}`}
            />

            {/* Delete Overlay */}
            {isPending && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 shadow-sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
            )}

            {/* Mobile Optimization: Always show button on touch devices? 
                Or just show it clearly. Let's make it always visible on mobile by removing 'group-hover:opacity-100' logic 
                or keeping it simple. For mobile-first, better to always have it accessible or use a better pattern.
                Let's make it always visible but semi-transparent until interaction?
                Actually, standard "always visible" mini button is best for clarity.
            */}
            {isPending && (
                <div className="absolute top-1 right-1">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shadow-md rounded-full"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
