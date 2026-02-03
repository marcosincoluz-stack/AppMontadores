'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for convenience, validate in production
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Check user role to redirect appropriately
    // Ideally, we check the public.users table for the role
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (userError || !userData) {
        // Fallback or error handling if user profile doesn't exist yet
        return { error: 'User profile not found.' }
    }

    if (userData.role === 'admin') {
        redirect('/admin')
    } else {
        redirect('/installer')
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
