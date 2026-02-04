'use client'

import { useState } from 'react'
import { ApprovalJobList } from './approval-job-list'
import { ApprovalDetailView } from './approval-detail-view'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

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
        <ResizablePanelGroup
            orientation="horizontal"
            className="h-full items-stretch rounded-md border"
        >
            <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="flex flex-col min-w-[300px]">
                <div className="flex items-center px-4 py-2 border-b bg-muted/30 h-[52px]">
                    <h1 className="text-xl font-bold">Revisiones ({jobs.length})</h1>
                </div>
                <ApprovalJobList
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    onSelect={setSelectedJobId}
                />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={70}>
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
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
