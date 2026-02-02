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
        return { error: 'Debes indicar un motivo de rechazo' }
    }

    const { error } = await supabase
        .from('jobs')
        .update({
            status: 'pending',
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
