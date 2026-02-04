'use client'

import { useState, useEffect } from 'react'
import { ApprovalJobList } from './approval-job-list'
import { ApprovalDetailView } from './approval-detail-view'

interface ApprovalsWorkspaceProps {
    initialJobs: any[]
}

export function ApprovalsWorkspace({ initialJobs }: ApprovalsWorkspaceProps) {
    const [jobs, setJobs] = useState(initialJobs)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(
        initialJobs.length > 0 ? initialJobs[0].id : null
    )

    const selectedJob = jobs.find(j => j.id === selectedJobId)

    // Handler to remove job from list after approval/rejection
    const handleJobProcessed = (jobId: string) => {
        const currentIndex = jobs.findIndex(j => j.id === jobId)
        const newJobs = jobs.filter(j => j.id !== jobId)
        setJobs(newJobs)

        // Auto-advance logic
        if (newJobs.length > 0) {
            // Try to keep same index, or go to last if we were at the end
            const nextIndex = Math.min(currentIndex, newJobs.length - 1)
            setSelectedJobId(newJobs[nextIndex].id)
        } else {
            setSelectedJobId(null)
        }
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <p className="text-xl font-medium">¡Todo listo!</p>
                <p>No hay revisiones pendientes.</p>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-4">
            <div className="w-[350px] flex-shrink-0 border rounded-lg bg-white overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold">Cola de Revisión ({jobs.length})</h3>
                </div>
                <div className="flex-1 overflow-auto">
                    <ApprovalJobList
                        jobs={jobs}
                        selectedJobId={selectedJobId}
                        onSelect={setSelectedJobId}
                    />
                </div>
            </div>

            <div className="flex-1 border rounded-lg bg-white overflow-hidden flex flex-col">
                {selectedJob ? (
                    <ApprovalDetailView
                        job={selectedJob}
                        onProcessed={() => handleJobProcessed(selectedJob.id)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Selecciona un trabajo para revisar
                    </div>
                )}
            </div>
        </div>
    )
}
