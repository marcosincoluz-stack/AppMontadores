'use client'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ApprovalJobListProps {
    jobs: any[]
    selectedJobId: string | null
    onSelect: (id: string) => void
}

export function ApprovalJobList({ jobs, selectedJobId, onSelect }: ApprovalJobListProps) {
    return (
        <div className="divide-y">
            {jobs.map((job) => (
                <button
                    key={job.id}
                    onClick={() => onSelect(job.id)}
                    className={cn(
                        "w-full text-left p-4 hover:bg-muted/50 transition-colors focus:outline-none focus:bg-muted",
                        selectedJobId === job.id && "bg-blue-50 hover:bg-blue-50 border-l-4 border-blue-500 pl-[12px]"
                    )}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium truncate pr-2" title={job.title}>{job.title}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                            {formatDistanceToNow(new Date(job.created_at), { locale: es, addSuffix: true })}
                        </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1 truncate" title={job.client_name}>
                            <span className="font-medium text-foreground">{job.client_name}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate text-xs" title={job.address}>
                            <MapPin className="w-3 h-3" />
                            {job.address}
                        </div>
                        <div className="flex items-center gap-1 truncate text-xs text-blue-600">
                            <User className="w-3 h-3" />
                            {(job.users as any)?.full_name || 'Sin asignar'}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    )
}
