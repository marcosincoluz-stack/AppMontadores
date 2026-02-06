'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, AlertCircle, ChevronRight, Clock, CheckCircle, Navigation, Loader2, ChevronDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IncidentStartupDialog } from '@/components/incident-startup-dialog'
import { NotificationsBtn } from '@/components/notifications-btn'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { JobWithDetails } from '@/types/app'
import { useRouter } from 'next/navigation'

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

export function InstallerJobsList({ initialJobs, rejectedCount, userId }: { initialJobs: JobWithDetails[], rejectedCount: number, userId: string }) {
    const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs)
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [historyLimit, setHistoryLimit] = useState(15)

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    const router = useRouter()
    // Fix: Ensure supabase client is stable across renders
    const [supabase] = useState(() => createClient())

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen) {
            // Slight delay to ensure animation has started/input is mounted
            // 300ms is usually safe for mobile keyboards to trigger after an interaction
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 300)
        }
    }, [isSearchOpen])

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('jobs_installer')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'jobs',
                    filter: `assigned_to=eq.${userId}`
                },
                (payload) => {
                    // Optimistic update or just refresh? 
                    // Refresh is safer to get full data and consistent sorting, 
                    // but we can also manually update the state for speed.

                    if (payload.eventType === 'INSERT') {
                        // Realtime INSERT doesn't have joined data (evidence). We make a best guess.
                        const newJob = { ...payload.new, evidence: [] } as unknown as JobWithDetails
                        setJobs((current) => [...current, newJob])
                        router.refresh() // Validates the real data from server
                    } else if (payload.eventType === 'UPDATE') {
                        setJobs((current) =>
                            current.map((job) => {
                                if (job.id === payload.new.id) {
                                    // Preserve existing evidence since Realtime doesn't send joins
                                    return { ...job, ...payload.new }
                                }
                                return job
                            })
                        )
                        router.refresh()
                    } else if (payload.eventType === 'DELETE') {
                        setJobs((current) => current.filter((job) => job.id !== payload.old.id))
                        router.refresh()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, router])

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

    // Sync initialJobs when they change from server (e.g. navigation)
    useEffect(() => {
        setJobs(initialJobs)
    }, [initialJobs])

    const sortedJobs = useMemo(() => {
        let filtered = [...jobs]

        // Apply Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(job =>
                (job.title?.toLowerCase().includes(query)) ||
                (job.client_name?.toLowerCase().includes(query)) ||
                (job.address?.toLowerCase().includes(query))
            )
        }

        return filtered.sort((a, b) => {
            // Priority 0: Incidents (Pending + Rejection Reason) - UPDATE: User emphasized this as TOP priority
            const aIsIncident = a.status === 'pending' && a.rejection_reason
            const bIsIncident = b.status === 'pending' && b.rejection_reason

            if (aIsIncident && !bIsIncident) return -1
            if (!aIsIncident && bIsIncident) return 1

            // Priority 1: Pending (Normal)
            const aIsPending = a.status === 'pending'
            const bIsPending = b.status === 'pending'

            if (aIsPending && !bIsPending) return -1
            if (!aIsPending && bIsPending) return 1

            // Calculate distances
            let distA = Infinity
            let distB = Infinity

            if (userLocation && a.lat && a.lng) distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
            if (userLocation && b.lat && b.lng) distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)

            // Within same category (Incidents or Pending): Sort by Distance
            if ((aIsIncident && bIsIncident) || (aIsPending && bIsPending)) {
                if (distA !== Infinity && distB !== Infinity) return distA - distB
                if (distA !== Infinity) return -1
                if (distB !== Infinity) return 1
            }

            // Fallback: Sort by Date (newest first)
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
        })
    }, [jobs, userLocation, searchQuery])

    const activeJobs = sortedJobs.filter(job =>
        job.status === 'pending' || job.status === 'en_revision'
    )
    const completedJobs = sortedJobs.filter(job =>
        job.status === 'approved' || job.status === 'paid'
    )

    const visibleCompletedJobs = completedJobs.slice(0, historyLimit)


    return (
        <div className="space-y-3 p-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-2 h-10">
                {!isSearchOpen ? (
                    <>
                        <h2 className="text-xl font-semibold tracking-tight">Mis Trabajos</h2>
                        <div className="flex items-center gap-1">
                            {userLocation && <Navigation className="h-4 w-4 text-green-500 animate-pulse mr-2" />}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <NotificationsBtn />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-10 duration-200">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                autoFocus
                                enterKeyHint="search"
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar cliente, dirección..."
                                className="pl-10 h-11 bg-background text-base" // Text-base prevents iOS zoom
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsSearchOpen(false)
                                setSearchQuery('')
                            }}
                            className="shrink-0 h-11 px-4 text-base font-medium text-muted-foreground hover:text-foreground active:bg-accent"
                        >
                            Cancelar
                        </Button>
                    </div>
                )}
            </div>

            <IncidentStartupDialog rejectedJobCount={rejectedCount} />

            <div className="space-y-6">
                {/* Active Jobs Section */}
                <div
                    className="space-y-2 touch-pan-y"
                    onTouchStart={() => {
                        // Dismiss keyboard when scrolling/touching the list
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur()
                        }
                    }}
                >
                    {activeJobs.map((job: any) => (
                        <JobCard key={job.id} job={job} userLocation={userLocation} />
                    ))}
                </div>

                {/* Completed Jobs Section */}
                {visibleCompletedJobs.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pb-1">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Historial</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        {visibleCompletedJobs.map((job: any) => (
                            <JobCard key={job.id} job={job} userLocation={userLocation} />
                        ))}

                        {completedJobs.length > historyLimit && (
                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground font-normal"
                                onClick={() => setHistoryLimit(prev => prev + 15)}
                            >
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Ver más antiguos ({completedJobs.length - historyLimit} restantes)
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {(!sortedJobs || sortedJobs.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                    <div className="bg-muted p-4 rounded-full">
                        {searchQuery ? (
                            <Search className="h-8 w-8 opacity-50" />
                        ) : (
                            <CheckCircle className="h-8 w-8 opacity-50" />
                        )}
                    </div>
                    <div className="space-y-1 max-w-[250px]">
                        <p className="font-medium text-lg text-foreground">
                            {searchQuery ? 'Sin resultados' : 'Todo al día'}
                        </p>
                        <p className="text-sm">
                            {searchQuery
                                ? `No encontramos nada para "${searchQuery}"`
                                : 'No tienes trabajos asignados pendientes.'
                            }
                        </p>
                    </div>
                    {searchQuery && (
                        <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                            className="mt-2 min-w-[150px]"
                        >
                            Limpiar búsqueda
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

function JobCard({ job, userLocation }: { job: any, userLocation: { lat: number, lng: number } | null }) {
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
            className="block group"
        >
            <Card className={`relative overflow-hidden transition-colors hover:bg-accent/50
                ${isRejected ? 'border-destructive/50' : ''}
                ${isClose ? 'border-green-500/50 bg-green-50/30' : ''}
            `}>
                <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base truncate leading-tight">
                                {job.title}
                            </h3>
                        </div>

                        <p className="text-sm text-muted-foreground truncate">
                            {job.client_name}
                        </p>

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
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
                                        <Loader2 className="h-3 w-3 text-orange-500" />
                                    )
                                )}
                                <span className={
                                    job.status === 'pending' ? 'text-orange-600 font-bold uppercase' :
                                        job.status === 'en_revision' ? 'text-blue-600' :
                                            job.status === 'approved' ? 'text-green-600' :
                                                job.status === 'paid' ? 'text-gray-600' : ''
                                }>
                                    {job.status === 'pending' && 'INCOMPLETO'}
                                    {job.status === 'en_revision' && 'Revisión'}
                                    {job.status === 'approved' && 'Aprobado'}
                                    {job.status === 'paid' && 'Pagado'}
                                </span>
                                {job.status === 'pending' && (
                                    <span className="relative flex h-2 w-2 ml-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                                    </span>
                                )}
                            </Badge>
                        )}
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
                            <span className="text-sm font-semibold">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(job.amount || 0)}
                            </span>
                        </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 transition-colors" />
                </div>
            </Card>
        </Link>
    )
}
