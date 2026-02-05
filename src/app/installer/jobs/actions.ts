'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteEvidence(evidenceId: string, evidenceUrl: string, jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    try {
        // 1. Delete from Storage
        let filePath = ''
        try {
            const urlObj = new URL(evidenceUrl)
            const pathParts = urlObj.pathname.split('/evidence/')
            if (pathParts.length > 1) {
                filePath = pathParts[1]
            }
        } catch (e) {
            console.error('Error parsing URL', e)
            return { error: 'URL de archivo inválida' }
        }

        if (filePath) {
            const { error: storageError } = await supabase.storage
                .from('evidence')
                .remove([filePath])

            if (storageError) {
                console.error('Storage deletion error:', storageError)
            }
        }

        // 2. Delete from Database
        const { error: dbError } = await supabase
            .from('evidence')
            .delete()
            .eq('id', evidenceId)

        if (dbError) {
            throw new Error(dbError.message)
        }

        revalidatePath(`/installer/jobs/${jobId}`)
        return { success: true }

    } catch (error: any) {
        return { error: error.message }
    }
}

import { createNotification } from '@/lib/notifications'

export async function completeJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    // 1. Update Job Status
    const { data: job, error: updateError } = await supabase
        .from('jobs')
        .update({ status: 'en_revision', rejection_reason: null })
        .eq('id', jobId)
        .select()
        .single()

    if (updateError) {
        console.error('Error updating job:', updateError)
        return { error: 'Error al finalizar el trabajo' }
    }

    // 2. Notify Admins
    // Fetch all admin users
    const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')

    if (admins && admins.length > 0) {
        await Promise.all(admins.map(admin =>
            createNotification({
                userId: admin.id,
                title: 'Trabajo Completado',
                message: `El instalador ha finalizado el trabajo: ${job.title}`,
                type: 'success',
                metadata: { jobId: job.id, link: `/admin/jobs` }
            })
        ))
    }

    revalidatePath('/installer')
    revalidatePath(`/installer/jobs/${jobId}`)
    return { success: true }
}

export async function checkAndCompleteJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    // 1. Check current status
    const { data: job } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', jobId)
        .single()

    if (job?.status !== 'pending') {
        // Already completed or in other state
        return { success: true, completed: false, missing: [], message: 'Job not pending' }
    }

    // 2. Count evidence
    const { data: evidence } = await supabase
        .from('evidence')
        .select('type')
        .eq('job_id', jobId)

    const photoCount = evidence?.filter(e => e.type === 'photo').length ?? 0
    const signatureCount = evidence?.filter(e => e.type === 'signature').length ?? 0

    const missing: string[] = []
    if (photoCount < 1) missing.push('Foto')
    if (signatureCount < 1) missing.push('Acta')

    // 3. Auto-complete if requirements met
    if (missing.length === 0) {
        await completeJob(jobId)
        return { success: true, completed: true, missing: [] }
    }

    // 4. Return missing items
    return { success: true, completed: false, missing }
}
