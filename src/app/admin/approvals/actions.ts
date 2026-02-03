'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveJob(jobId: string) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('jobs')
        .update({ status: 'approved' })
        .eq('id', jobId)

    if (error) {
        return { error: error.message }
    }

    // Here we would trigger the Payment webhook/logic
    // For now just update status

    revalidatePath('/admin/approvals')
    revalidatePath('/admin/jobs')
    return { success: true }
}

export async function rejectJob(jobId: string, reason: string) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!reason.trim()) {
        return { error: 'Debes indicar un motivo para solicitar cambios' }
    }

    const { error } = await supabase
        .from('jobs')
        .update({
            status: 'pending', // Always set to pending so installer can edit
            rejection_reason: reason.trim()
        })
        .eq('id', jobId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin/jobs')
    revalidatePath('/installer')
    return { success: true }
}

export async function revertJobStatus(jobId: string, reason?: string) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // If reason is provided, treat it as a "Request Changes" (pending)
    // If no reason, it might be an internal revert (en_revision), but to be safe and consistent with user request,
    // let's prefer 'pending' if we want the installer to see it.
    // However, if the admin just wants to undo approval to review again, 'en_revision' is better.
    // Logic: If reason is present -> pending. If not -> en_revision.

    const status = reason ? 'pending' : 'en_revision'
    const updateData: any = { status }

    if (reason) {
        updateData.rejection_reason = reason
    }

    const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/jobs')
    revalidatePath('/admin/approvals')
    revalidatePath('/installer')
    return { success: true }
}
