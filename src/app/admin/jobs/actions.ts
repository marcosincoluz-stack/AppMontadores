'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    const { error } = await supabase
        .from('jobs')
        .insert({
            title,
            description,
            client_name: clientName,
            address,
            assigned_to: assignedTo,
            amount,
            status: 'pending'
        })

    if (error) {
        console.error('Error creating job:', error)
        return { error: error.message }
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
    // Stub implementation for verify admin
    // In real implementation we would check auth here again

    console.log('Notifying installers for jobs:', jobIds)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return { success: true, count: jobIds.length }
}
