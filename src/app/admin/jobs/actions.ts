'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from '@/lib/notifications'
import { geocodeAddress } from '@/lib/geocoding'
import { sendPushNotification } from '@/lib/push'

export async function createJob(formData: FormData) {
    const supabase = await createClient()

    // Validate admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const clientName = formData.get('clientName') as string
    const address = formData.get('address') as string
    const assignedTo = formData.get('assignedTo') as string
    const amountStr = formData.get('amount') as string
    const amount = amountStr ? parseFloat(amountStr) : null

    // Attempt to geocode
    const coords = await geocodeAddress(address)
    console.log(`Geocoding '${address}':`, coords)

    const { data: job, error } = await supabase
        .from('jobs')
        .insert({
            title,
            description,
            client_name: clientName,
            address,
            assigned_to: assignedTo,
            amount,
            status: 'pending',
            lat: coords?.lat || null,
            lng: coords?.lng || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating job:', error)
        return { error: error.message }
    }

    // Notify assigned installer
    if (assignedTo && job) {
        await createNotification({
            userId: assignedTo,
            title: 'Nuevo trabajo asignado',
            message: `Se te ha asignado el trabajo: ${title} en ${clientName}`,
            type: 'info',
            metadata: { jobId: job.id }
        })
        // Send Push Notification (non-blocking)
        try {
            await sendPushNotification(
                assignedTo,
                'Nuevo trabajo asignado',
                `${title} en ${clientName}`,
                `/installer/jobs/${job.id}`
            )
        } catch (e) {
            console.error('Push notification failed:', e)
        }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/installer') // Update installer dashboard too
    return { success: true }
}

export async function deleteJob(jobId: string) {
    const supabase = await createClient()

    // 1. Validate admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        return { error: 'No autorizado' }
    }

    // 2. Fetch job to verify status
    const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', jobId)
        .single()

    if (fetchError || !job) {
        return { error: 'Trabajo no encontrado' }
    }

    // 3. Only allow deletion if status is appropriate
    if (job.status !== 'pending' && job.status !== 'en_revision') {
        return { error: 'Solo se pueden eliminar trabajos pendientes o en revisión' }
    }

    // 4. Delete
    const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

    if (deleteError) {
        return { error: deleteError.message }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/installer')
    return { success: true }
}

export async function notifyInstallers(jobIds: string[]) {
    if (!jobIds.length) return { success: false }

    const supabase = await createClient()

    // Fetch jobs to get assigned users
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, assigned_to')
        .in('id', jobIds)
        .not('assigned_to', 'is', null)

    if (!jobs || jobs.length === 0) return { success: true, count: 0 }

    let count = 0

    // Create notifications for each job
    await Promise.all(jobs.map(async (job) => {
        if (job.assigned_to) {
            await createNotification({
                userId: job.assigned_to,
                title: 'Recordatorio de trabajo',
                message: `Recordatorio sobre el trabajo pendiente: ${job.title}`,
                type: 'warning',
                metadata: { jobId: job.id }
            })
            // Send Push Notification (non-blocking, errors logged)
            try {
                await sendPushNotification(
                    job.assigned_to,
                    'Recordatorio de trabajo',
                    `Trabajo pendiente: ${job.title}`,
                    `/installer/jobs/${job.id}`
                )
            } catch (e) {
                console.error('Push notification failed:', e)
            }
            count++
        }
    }))

    return { success: true, count }
}

export async function getJobsEvidence(jobIds: string[]) {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
        console.error('Auth error in getJobsEvidence:', authError)
        throw new Error(`Error de autenticación: ${authError.message}`)
    }
    if (!user) {
        throw new Error('No autorizado - Por favor inicia sesión de nuevo')
    }

    // 2. Verify user is admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userError || userData?.role !== 'admin') {
        throw new Error('Acceso denegado - Solo administradores')
    }

    // 3. Fetch Jobs + Evidence
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
            id,
            title,
            client_name,
            evidence (
                id,
                url,
                type,
                form_data
            )
        `)
        .in('id', jobIds)

    if (error) {
        console.error('Error fetching jobs evidence:', error)
        throw new Error(`Error de base de datos: ${error.message}`)
    }

    console.log(`[getJobsEvidence] Fetched ${jobs?.length || 0} jobs for user ${user.id}`)
    return jobs
}
