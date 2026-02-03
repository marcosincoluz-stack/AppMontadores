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
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                throw new Error('No estás autenticado. Por favor, inicia sesión de nuevo.')
            }
            console.log('Auto-upload by user:', user.id, 'for job:', jobId)

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
        <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">{title}</h4>
            <Card className={`border-dashed border-2 transition-colors ${isUploading ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4">
                    {isUploading ? (
                        <div className="text-center space-y-3 py-2">
                            <div className="flex justify-center">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            </div>
                            <p className="text-sm font-medium text-blue-700">Subiendo y optimizando...</p>
                        </div>
                    ) : (
                        <div className="text-center space-y-2 w-full">
                            <div className="flex justify-center">
                                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                    <CloudUpload className="h-8 w-8" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">
                                Pulsa para hacer foto o elegir de galería
                            </p>

                            <div className="relative">
                                <Label htmlFor={`upload-${evidenceType}`} className="absolute inset-0 cursor-pointer text-transparent">
                                    {title}
                                </Label>
                                <Input
                                    id={`upload-${evidenceType}`}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                                {/* Custom Button Overlay for better styling */}
                                <Button variant="outline" className="w-full mt-2 pointer-events-none">
                                    Seleccionar Archivo
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
