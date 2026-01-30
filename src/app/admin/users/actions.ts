'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInstaller(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    // Call the secure RPC function
    // Note: RPC will fail if current user is not admin
    const { data, error } = await supabase.rpc('create_new_installer', {
        email,
        password,
        full_name: fullName
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    // Update the public.users table with the phone number? 
    // The trigger handles basic creating, but phone is not in the RPC args I defined!
    // I should have added phone to RPC. But I can update it now.
    // The trigger inserts into public.users.
    // Let's update the user after creation to add phone.

    if (data) { // data is new_id
        const { error: updateError } = await supabase
            .from('users')
            .update({ phone: phone })
            .eq('id', data)

        if (updateError) {
            console.error('Error updating phone:', updateError)
            // Non-critical error, user is created
        }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
