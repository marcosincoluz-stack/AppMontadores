'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CloudUpload, Trash2, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import imageCompression from 'browser-image-compression'

export function UploadEvidenceForm({
    jobId,
    jobStatus,
    title = "Subir Evidencia",
    evidenceType = 'photo'
}: {
    jobId: string,
    jobStatus: string,
    title?: string,
    evidenceType?: 'photo' | 'signature'
}) {
    const [isUploading, setIsUploading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // We don't need persistent file state anymore for confirmation, 
    // but we can keep localPreview to show what's being uploaded if needed, 
    // or just show a loading spinner.

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            await handleUpload(selectedFile)
        }
    }

    const handleUpload = async (fileToProcess: File) => {
        setIsUploading(true)
        try {
            // Try to get session, with fallback to explicit refresh
            let { data: { session }, error: authError } = await supabase.auth.getSession()

            // If no session, try to refresh it explicitly
            if (!session) {
                console.log('No session found, attempting explicit refresh...')
                const refreshResult = await supabase.auth.refreshSession()
                session = refreshResult.data.session
                authError = refreshResult.error
            }

            if (authError || !session?.user) {
                // Redirect to login if no valid session
                toast.error('Sesión expirada. Redirigiendo al login...')
                router.push('/login')
                return
            }
            console.log('Auto-upload by user:', session.user.id, 'for job:', jobId)

            // Compression options
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/jpeg'
            }

            let filePayload = fileToProcess
            // Only compress images
            if (fileToProcess.type.startsWith('image/')) {
                try {
                    filePayload = await imageCompression(fileToProcess, options)
                } catch (error) {
                    console.error('Compression error:', error)
                    toast.warning('No se pudo comprimir la imagen, subiendo original...')
                }
            }

            const fileName = `${jobId}/${Date.now()}-${fileToProcess.name}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('evidence')
                .upload(fileName, filePayload)

            if (uploadError) {
                throw new Error(`Error de storage: ${uploadError.message}`)
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('evidence')
                .getPublicUrl(fileName)

            // 3. Insert into DB
            const { error: dbError } = await supabase
                .from('evidence')
                .insert({
                    job_id: jobId,
                    url: publicUrl,
                    type: evidenceType,
                    uploaded_at: new Date().toISOString()
                })

            if (dbError) {
                if (dbError.code === '42501') {
                    throw new Error('No tienes permiso para subir fotos a este trabajo.')
                }
                throw new Error(`Error de base de datos: ${dbError.message}`)
            }

            toast.success('Archivo subido correctamente')
            router.refresh()

        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error('Error al subir: ' + error.message)
        } finally {
            setIsUploading(false)
            // Reset input if needed, though react re-render might handle it
        }
    }

    return (
        <div className="w-full">
            <Card className={`border-dashed border-2 hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden ${isUploading ? 'bg-blue-50 border-blue-200' : 'bg-gray-50/50 border-gray-200'}`}>
                <CardContent className="p-0">
                    <div className="relative h-24 flex flex-col items-center justify-center gap-2 p-2">
                        {isUploading ? (
                            <>
                                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                <span className="text-[10px] text-blue-600 font-medium">Subiendo...</span>
                            </>
                        ) : (
                            <>
                                <div className="p-2 bg-blue-100/50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                                    <CloudUpload className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-gray-700">Pulsa para añadir</span>
                                    <span className="text-[10px] text-gray-500 leading-none">Pulsa aquí</span>
                                </div>
                            </>
                        )}

                        <Input
                            id={`upload-${evidenceType}`}
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
