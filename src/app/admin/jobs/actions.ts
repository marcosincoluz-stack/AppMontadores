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
