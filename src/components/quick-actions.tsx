'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Bell, UserPlus } from "lucide-react"
import Link from "next/link"
import { notifyInstallers } from "@/app/admin/jobs/actions"
import { toast } from "sonner"
import { useState } from "react"

export function QuickActions() {
    const [sending, setSending] = useState(false)

    async function handleSendReminders() {
        setSending(true)
        try {
            // Get all pending job IDs and send reminders
            const response = await fetch('/api/pending-jobs')
            const { jobIds } = await response.json()

            if (jobIds && jobIds.length > 0) {
                const result = await notifyInstallers(jobIds)
                if (result.success) {
                    toast.success(`Recordatorios enviados a ${result.count} montadores`)
                } else {
                    toast.error('Error al enviar recordatorios')
                }
            } else {
                toast.info('No hay trabajos pendientes')
            }
        } catch {
            toast.error('Error al enviar recordatorios')
        }
        setSending(false)
    }

    return (
        <Card className="mx-4 lg:mx-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Link href="/admin/jobs?create=true">
                    <Button variant="default" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Crear Trabajo
                    </Button>
                </Link>
                <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={handleSendReminders}
                    disabled={sending}
                >
                    <Bell className="h-4 w-4" />
                    {sending ? 'Enviando...' : 'Enviar Recordatorios'}
                </Button>
                <Link href="/admin/users?create=true">
                    <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Añadir Montador
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
