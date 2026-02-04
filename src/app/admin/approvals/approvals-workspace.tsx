'use client'

import { useState } from 'react'
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
        <div className="flex h-full rounded-lg border overflow-hidden">
            {/* Left Sidebar - Job List */}
            <div className="w-80 shrink-0 flex flex-col border-r bg-muted/30">
                <div className="flex items-center px-4 py-3 border-b bg-background/50 shrink-0">
                    <h1 className="text-lg font-semibold">Revisiones ({jobs.length})</h1>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ApprovalJobList
                        jobs={jobs}
                        selectedJobId={selectedJobId}
                        onSelect={setSelectedJobId}
                    />
                </div>
            </div>

            {/* Right Panel - Detail View */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
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
