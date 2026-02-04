'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Check if browser supports push
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            checkSubscription()
        } else {
            setIsLoading(false)
        }
    }, [])

    async function checkSubscription() {
        try {
            // Check if service worker is controlling this page
            if (!navigator.serviceWorker.controller) {
                // No SW active yet, not subscribed
                setIsSubscribed(false)
                setIsLoading(false)
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (e) {
            console.error('Error checking subscription:', e)
        }
        setIsLoading(false)
    }

    async function subscribe() {
        if (!isSupported) return false

        try {
            console.log('[Push] Starting subscription...')

            // Register service worker if not already
            console.log('[Push] Registering service worker...')
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready
            console.log('[Push] Service worker ready')

            // Request permission
            console.log('[Push] Requesting permission...')
            const permission = await Notification.requestPermission()
            console.log('[Push] Permission:', permission)
            if (permission !== 'granted') {
                console.log('[Push] Permission denied')
                return false
            }

            // Check VAPID key
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            console.log('[Push] VAPID key present:', !!vapidKey, vapidKey?.substring(0, 10) + '...')
            if (!vapidKey) {
                console.error('[Push] VAPID key missing!')
                return false
            }

            // Subscribe to push
            console.log('[Push] Subscribing to push manager...')
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            })
            console.log('[Push] Subscription created:', subscription.endpoint.substring(0, 50) + '...')

            // Save to database
            console.log('[Push] Getting user...')
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                console.error('[Push] No user found')
                return false
            }
            console.log('[Push] User ID:', user.id)

            console.log('[Push] Saving to database...')
            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    subscription: subscription.toJSON(),
                    user_agent: navigator.userAgent
                }, {
                    onConflict: 'user_id'
                })

            if (error) {
                console.error('[Push] Database error:', error)
                return false
            }

            console.log('[Push] Success!')
            setIsSubscribed(true)
            return true
        } catch (e) {
            console.error('[Push] Subscribe error:', e)
            return false
        }
    }

    async function unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                await subscription.unsubscribe()

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', user.id)
                }
            }

            setIsSubscribed(false)
            return true
        } catch (e) {
            console.error('Unsubscribe error:', e)
            return false
        }
    }

    return {
        isSupported,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe
    }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}
