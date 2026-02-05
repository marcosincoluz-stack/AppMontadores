'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function AuthListener() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'TOKEN_REFRESHED') {
                // When the token is refreshed, we need to make a request to the server
                // so the middleware can update the cookies
                router.refresh()
            }

            if (event === 'SIGNED_OUT') {
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    return null
}
