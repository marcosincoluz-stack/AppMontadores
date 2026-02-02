'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Props = {
    jobId: string
    initialPhotoCount?: number
    initialSignatureCount?: number
}

export function CompleteJobButton({ jobId, initialPhotoCount = 0, initialSignatureCount = 0 }: Props) {
    const [isPending, startTransition] = useTransition()
    const [photoCount, setPhotoCount] = useState(initialPhotoCount)
    const [signatureCount, setSignatureCount] = useState(initialSignatureCount)
    const [isLoading, setIsLoading] = useState(false) // Changed to false since we have initial data
    const router = useRouter()
    const supabase = createClient()

    const canComplete = photoCount > 0 && signatureCount > 0

    useEffect(() => {
        const fetchEvidence = async () => {
            console.log('[CompleteJobButton] Fetching evidence for job:', jobId)

            const { data, error } = await supabase
                .from('evidence')
                .select('type')
                .eq('job_id', jobId)

            console.log('[CompleteJobButton] Evidence query result:', { data, error })

            if (error) {
                console.error('[CompleteJobButton] Error fetching evidence:', error)
            }

            if (data) {
                const photos = data.filter(e => e.type === 'photo').length
                const sigs = data.filter(e => e.type === 'signature').length
                console.log('[CompleteJobButton] Counts - Photos:', photos, 'Signatures:', sigs)
                setPhotoCount(photos)
                setSignatureCount(sigs)
            }
            setIsLoading(false)
        }
        fetchEvidence()

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`evidence-${jobId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'evidence',
                filter: `job_id=eq.${jobId}`
            }, (payload) => {
                console.log('[CompleteJobButton] Realtime event:', payload)
                fetchEvidence()
            })
            .subscribe((status) => {
                console.log('[CompleteJobButton] Realtime subscription status:', status)
            })

        return () => { supabase.removeChannel(channel) }
    }, [jobId]) // Removed supabase from deps to avoid infinite loop

    const handleComplete = () => {
        if (!canComplete) return

        startTransition(async () => {
            const { error } = await supabase
                .from('jobs')
                .update({ status: 'en_revision', rejection_reason: null })
                .eq('id', jobId)

            if (error) {
                toast.error('Error al finalizar el trabajo')
                console.error(error)
            } else {
                toast.success('Trabajo enviado para revisión')
                router.push('/installer')
                router.refresh()
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {!canComplete && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">Faltan evidencias obligatorias:</p>
                        <ul className="list-disc list-inside mt-1 text-xs">
                            {photoCount === 0 && <li>Sube al menos 1 foto del trabajo</li>}
                            {signatureCount === 0 && <li>Sube el acta firmada</li>}
                        </ul>
                    </div>
                </div>
            )}
            <Button
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                onClick={handleComplete}
                disabled={isPending || !canComplete}
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Finalizar Trabajo y Notificar
            </Button>
        </div>
    )
}
