import { createAdminClient } from '@/utils/supabase/server'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export async function createNotification({
    userId,
    title,
    message,
    type = 'info',
    metadata = {}
}: {
    userId: string
    title: string
    message: string
    type?: NotificationType
    metadata?: Record<string, any>
}) {
    const supabase = await createAdminClient()

    try {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                metadata
            })

        if (error) {
            console.error('Error creating notification:', error)
            return { error }
        }

        return { success: true }
    } catch (e: any) {
        console.error('Exception creating notification:', e)
        // Return success=false instead of throwing, so calling code doesn't crash if it awaits this
        return { error: e.message || 'Unknown error' }
    }
}
