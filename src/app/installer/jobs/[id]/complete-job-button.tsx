'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CompleteJobButton({ jobId }: { jobId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const supabase = createClient()

    const handleComplete = () => {
        startTransition(async () => {
            const { error } = await supabase
                .from('jobs')
                .update({ status: 'completed' })
                .eq('id', jobId)

            if (error) {
                toast.error('Error al finalizar el trabajo')
                console.error(error)
            } else {
                toast.success('Trabajo finalizado correctamente')
                router.push('/installer') // Go back to dashboard
                router.refresh()
            }
        })
    }

    return (
        <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Finalizar Trabajo y Notificar
        </Button>
    )
}
