'use client'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, User, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ApprovalJobListProps {
    jobs: any[]
    selectedJobId: string | null
    onSelect: (id: string) => void
}

export function ApprovalJobList({ jobs, selectedJobId, onSelect }: ApprovalJobListProps) {
    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4 pt-0">
                {jobs.map((job) => (
                    <button
                        key={job.id}
                        onClick={() => onSelect(job.id)}
                        className={cn(
                            "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                            selectedJobId === job.id && "bg-accent border-primary/50 ring-1 ring-primary/20"
                        )}
                    >
                        <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center">
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{job.client_name}</div>
                                    {!job.read && (
                                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                    )}
                                </div>
                                <div className={cn(
                                    "ml-auto text-xs",
                                    selectedJobId === job.id ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {formatDistanceToNow(new Date(job.created_at), { locale: es, addSuffix: true })}
                                </div>
                            </div>
                            <div className="text-xs font-medium">{job.title}</div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                            {job.address.substring(0, 300)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                                {(job.users as any)?.full_name || 'Sin asignar'}
                            </Badge>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    )
}
