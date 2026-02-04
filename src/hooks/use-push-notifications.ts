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
            // Register service worker if not already
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            // Request permission
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                console.log('Notification permission denied')
                return false
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                )
            })

            // Save to database
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

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
                console.error('Error saving subscription:', error)
                return false
            }

            setIsSubscribed(true)
            return true
        } catch (e) {
            console.error('Subscribe error:', e)
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
