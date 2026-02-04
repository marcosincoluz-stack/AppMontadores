'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { toast } from 'sonner'

export function PushNotificationToggle() {
    const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

    if (!isSupported) {
        return (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BellOff className="h-4 w-4" />
                    <span>Notificaciones no disponibles en este navegador</span>
                </div>
            </div>
        )
    }

    const handleToggle = async () => {
        if (isSubscribed) {
            const success = await unsubscribe()
            if (success) {
                toast.success('Notificaciones desactivadas')
            } else {
                toast.error('Error al desactivar notificaciones')
            }
        } else {
            const success = await subscribe()
            if (success) {
                toast.success('¡Notificaciones activadas!')
            } else {
                toast.error('No se pudieron activar las notificaciones')
            }
        }
    }

    return (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Notificaciones Push</span>
            </div>
            <Button
                variant={isSubscribed ? "outline" : "default"}
                size="sm"
                onClick={handleToggle}
                disabled={isLoading}
                className="h-8"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubscribed ? (
                    'Desactivar'
                ) : (
                    'Activar'
                )}
            </Button>
        </div>
    )
}
