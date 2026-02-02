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
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [localPreview, setLocalPreview] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setLocalPreview(URL.createObjectURL(selectedFile))
        }
    }

    const handleRemove = () => {
        setFile(null)
        setLocalPreview(null)
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        try {
            // Debug: Check authentication status
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                throw new Error('No estás autenticado. Por favor, inicia sesión de nuevo.')
            }
            console.log('Upload attempt by user:', user.id, 'for job:', jobId)

            const fileName = `${jobId}/${Date.now()}-${file.name}`

            // 1. Upload to Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('evidence')
                .upload(fileName, file)

            if (uploadError) {
                console.error('Storage upload error:', uploadError)
                throw new Error(`Error de storage: ${uploadError.message}`)
            }

            // 2. Get Public URL (or just path)
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
                console.error('Database insert error:', dbError)
                if (dbError.code === '42501') {
                    throw new Error('No tienes permiso para subir fotos a este trabajo. Verifica que el trabajo esté asignado a ti.')
                }
                throw new Error(`Error de base de datos: ${dbError.message}`)
            }

            toast.success('Archivo subido correctamente')
            handleRemove()
            router.refresh()

        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error('Error al subir: ' + error.message)

            // Here we could implement "Offline Save" if error is network related
            if (!navigator.onLine) {
                saveOffline(file)
            }
        } finally {
            setIsUploading(false)
        }
    }

    const saveOffline = (file: File) => {
        // Basic offline implementation: Alert user
        toast("Sin conexión. El archivo se ha guardado (simulado) para subir después.", {
            icon: <WifiOff className="h-4 w-4" />
        })
        // In a real PWA we would use IndexedDB here.
    }

    return (
        <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">{title}</h4>
            <Card className="border-dashed border-2 bg-gray-50">
                <CardContent className="pt-6 flex flex-col items-center gap-4">
                    {localPreview ? (
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                            <img src={localPreview} alt="Preview" className="object-contain w-full h-full" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemove}
                                disabled={isUploading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="flex justify-center">
                                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                    <CloudUpload className="h-8 w-8" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">Haz una foto o selecciona de la galería</p>
                        </div>
                    )}

                    <div className="w-full">
                        <Label htmlFor={`upload-${evidenceType}`} className="sr-only">{title}</Label>
                        {!localPreview && (
                            <Input
                                id={`upload-${evidenceType}`}
                                type="file"
                                accept="image/*"
                                capture="environment" // Opens camera on mobile
                                className="w-full cursor-pointer"
                                onChange={handleFileChange}
                            />
                        )}

                        {localPreview && (
                            <Button className="w-full mt-2" onClick={handleUpload} disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    'Confirmar y Subir'
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
