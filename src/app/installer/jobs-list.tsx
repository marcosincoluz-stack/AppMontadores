'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, AlertCircle, ChevronRight, Clock, CheckCircle, Navigation, Loader2 } from 'lucide-react'
import { IncidentStartupDialog } from '@/components/incident-startup-dialog'
import { NotificationsBtn } from '@/components/notifications-btn'
import type { Database } from '@/types/supabase'

type Job = any // Using any for now to avoid extensive type definitions, or define a shape
// Idealmente: Database['public']['Tables']['jobs']['Row']

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3 // metres
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const d = R * c // in metres
    return d
}

export function InstallerJobsList({ initialJobs, rejectedCount }: { initialJobs: any[], rejectedCount: number }) {
    const [jobs, setJobs] = useState(initialJobs)
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [permissionDenied, setPermissionDenied] = useState(false)

    useEffect(() => {
        if (!navigator.geolocation) return

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => {
                console.error("Geolocation error:", error)
                if (error.code === error.PERMISSION_DENIED) {
                    setPermissionDenied(true)
                }
            }
        )
    }, [])

    useEffect(() => {
        if (!userLocation) {
            setJobs(initialJobs) // Fallback to server sort
            return
        }

        const sorted = [...initialJobs].sort((a, b) => {
            // Priority 0: Status (PENDING is always first)
            const aIsPending = a.status === 'pending'
            const bIsPending = b.status === 'pending'

            if (aIsPending && !bIsPending) return -1
            if (!aIsPending && bIsPending) return 1

            // Calculate distances
            let distA = Infinity
            let distB = Infinity

            if (a.lat && a.lng) distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
            if (b.lat && b.lng) distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)

            // If both are PENDING
            if (aIsPending && bIsPending) {
                // Priority 1: Rejected/Incidents (Most urgent)
                const aRejected = a.rejection_reason
                const bRejected = b.rejection_reason
                if (aRejected && !bRejected) return -1
                if (!aRejected && bRejected) return 1

                // Priority 2: Distance
                if (distA !== Infinity && distB !== Infinity) return distA - distB
                if (distA !== Infinity) return -1
                if (distB !== Infinity) return 1
            }

            // If both are NON-PENDING (or fallback for pending without location/rejection diff)
            // Sort by Date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        setJobs(sorted)
    }, [userLocation, initialJobs])

    return (
        <div className="space-y-3 p-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Mis Trabajos</h2>
                <div className="flex items-center gap-2">
                    {userLocation && <Navigation className="h-4 w-4 text-green-500 animate-pulse" />}
                    <NotificationsBtn />
                </div>
            </div>

            <IncidentStartupDialog rejectedJobCount={rejectedCount} />

            <div className="space-y-2">
                {jobs.map((job: any) => {
                    const isRejected = job.status === 'pending' && job.rejection_reason
                    let distanceText = ''
                    let isClose = false

                    if (userLocation && job.lat && job.lng) {
                        const dist = calculateDistance(userLocation.lat, userLocation.lng, job.lat, job.lng)
                        if (dist < 1000) {
                            distanceText = `${Math.round(dist)}m`
                            isClose = dist < 500
                        } else {
                            distanceText = `${(dist / 1000).toFixed(1)}km`
                        }
                    }

                    return (
                        <Link
                            href={`/installer/jobs/${job.id}`}
                            key={job.id}
                            className="block group"
                        >
                            <Card className={`relative overflow-hidden transition-colors hover:bg-accent/50
                                ${isRejected ? 'border-destructive/50' : ''}
                                ${isClose ? 'border-green-500/50 bg-green-50/30' : ''}
                            `}>
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-sm truncate leading-none">
                                                {job.title}
                                            </h3>

                                            {isRejected ? (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px] tracking-wide uppercase">
                                                    Incidencia
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground gap-1.5 py-0.5 pr-2.5 pl-1.5 font-normal border">
                                                    {job.status === 'approved' || job.status === 'paid' ? (
                                                        <CheckCircle className="h-3 w-3 fill-green-500 text-white" />
                                                    ) : (
                                                        job.status === 'en_revision' ? (
                                                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                                        ) : (
                                                            <Loader2 className="h-3 w-3 text-amber-500" />
                                                        )
                                                    )}
                                                    <span className={
                                                        job.status === 'pending' ? 'text-amber-600' :
                                                            job.status === 'en_revision' ? 'text-blue-600' :
                                                                job.status === 'approved' ? 'text-green-600' :
                                                                    job.status === 'paid' ? 'text-gray-600' : ''
                                                    }>
                                                        {job.status === 'pending' && 'Pendiente'}
                                                        {job.status === 'en_revision' && 'Revisión'}
                                                        {job.status === 'approved' && 'Aprobado'}
                                                        {job.status === 'paid' && 'Pagado'}
                                                    </span>
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground truncate">
                                            {job.client_name}
                                        </p>

                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="truncate">{job.address}</span>
                                        </div>

                                        {isRejected && (
                                            <div className="mt-2 text-xs text-destructive font-medium flex items-start gap-1">
                                                <AlertCircle className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
                                                <span className="line-clamp-1">{job.rejection_reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 self-center">
                                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full
                                            ${job.status === 'paid'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                                            }
                                        `}>
                                            {job.status === 'paid' ? (
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <Clock className="h-3.5 w-3.5" />
                                            )}
                                            <span>
                                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(job.amount || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 transition-colors" />
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {(!jobs || jobs.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                    <div className="bg-muted p-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">Todo al día</p>
                        <p className="text-xs">No tienes trabajos asignados.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
