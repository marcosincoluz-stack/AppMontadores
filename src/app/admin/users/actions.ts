'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInstaller(formData: FormData) {
    const supabaseAdmin = await createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const role = (formData.get('role') as 'admin' | 'installer') || 'installer'

    // Create user with Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: fullName, role },
        email_confirm: true // Auto confirm email
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    if (data.user) {
        // Update public.users table to ensure role and phone are set correctly
        // (Trigger might have inserted partial data, let's update strict)
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                full_name: fullName,
                phone: phone,
                role: role
            })
            .eq('id', data.user.id)

        if (updateError) {
            console.error('Error updating user profile:', updateError)
        }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
