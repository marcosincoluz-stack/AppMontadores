import webpush from 'web-push'
import { createClient } from '@/utils/supabase/server'

let vapidConfigured = false

function ensureVapidConfigured() {
    if (vapidConfigured) return true

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
        console.warn('[Push] VAPID keys not configured, skipping push')
        return false
    }

    try {
        webpush.setVapidDetails(
            `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
            publicKey,
            privateKey
        )
        vapidConfigured = true
        return true
    } catch (e) {
        console.error('[Push] Failed to configure VAPID:', e)
        return false
    }
}

export async function sendPushNotification(
    userId: string,
    title: string,
    body: string,
    url?: string
) {
    // Lazy VAPID configuration
    if (!ensureVapidConfigured()) {
        return { sent: 0, error: 'VAPID not configured' }
    }

    const supabase = await createClient()

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId)

    if (error || !subscriptions || subscriptions.length === 0) {
        console.log(`[Push] No subscriptions for user ${userId}`)
        return { sent: 0 }
    }

    const payload = JSON.stringify({ title, body, url })
    let sent = 0

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(sub.subscription, payload)
            sent++
        } catch (err: any) {
            console.error('[Push] Send error:', err.statusCode, err.message)
            // If subscription is expired/invalid, remove it
            if (err.statusCode === 410 || err.statusCode === 404) {
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('subscription', sub.subscription)
            }
        }
    }

    return { sent }
}
