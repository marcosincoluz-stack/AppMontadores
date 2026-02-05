'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

type Props = {
    jobId: string
    initialPhotoCount?: number
    initialSignatureCount?: number
}

export function JobStatusFooter({ jobId, initialPhotoCount = 0, initialSignatureCount = 0 }: Props) {
    const [photoCount, setPhotoCount] = useState(initialPhotoCount)
    const [signatureCount, setSignatureCount] = useState(initialSignatureCount)
    const [isCompleting, setIsCompleting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setPhotoCount(initialPhotoCount)
    }, [initialPhotoCount])

    useEffect(() => {
        setSignatureCount(initialSignatureCount)
    }, [initialSignatureCount])

    useEffect(() => {
        const fetchEvidence = async () => {
            const { data } = await supabase
                .from('evidence')
                .select('type')
                .eq('job_id', jobId)

            if (data) {
                setPhotoCount(data.filter(e => e.type === 'photo').length)
                setSignatureCount(data.filter(e => e.type === 'signature').length)
            }
        }

        const channel = supabase
            .channel(`evidence-footer-${jobId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'evidence',
                filter: `job_id=eq.${jobId}`
            }, () => {
                fetchEvidence()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [jobId, supabase])

    const missing = []
    if (photoCount === 0) missing.push('1 Foto')
    if (signatureCount === 0) missing.push('Acta')

    const isComplete = missing.length === 0

    // visual check: if complete, we assume it's being processed
    useEffect(() => {
        if (isComplete) {
            setIsCompleting(true)
        } else {
            setIsCompleting(false)
        }
    }, [isComplete])

    if (isCompleting) {
        return (
            <div className="w-full bg-green-600 text-white p-4 shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom duration-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-bold">Verificando y finalizando trabajo...</span>
            </div>
        )
    }

    return (
        <div className="w-full bg-amber-50 border-t-2 border-amber-500 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-amber-100 p-2 rounded-full shrink-0">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        {/* Bouncing notification dot */}
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                    </div>
                    <div>
                        <p className="font-black text-amber-900 leading-tight uppercase tracking-tight">TRABAJO INCOMPLETO</p>
                        <p className="text-amber-800 text-xs font-medium mt-0.5">
                            Falta por subir: <span className="font-bold underline decoration-amber-500/50">{missing.join(' + ')}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
