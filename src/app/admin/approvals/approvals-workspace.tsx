'use client'

import { useState } from 'react'
import { ApprovalJobList } from './approval-job-list'
import { ApprovalDetailView } from './approval-detail-view'

import { JobWithDetails } from '@/types/app'

interface ApprovalsWorkspaceProps {
    initialJobs: JobWithDetails[]
}

export function ApprovalsWorkspace({ initialJobs }: ApprovalsWorkspaceProps) {
    const [jobs, setJobs] = useState<JobWithDetails[]>(initialJobs)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

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
            {/* On mobile, hidden if we have a selected job. On desktop, always flex. */}
            <div className={`w-full md:w-80 shrink-0 flex-col border-r bg-muted/30 ${selectedJobId ? 'hidden md:flex' : 'flex'}`}>
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
            {/* On mobile, hidden if NO job selected. On desktop, always flex. */}
            <div className={`flex-1 flex-col min-w-0 bg-background ${selectedJobId ? 'flex' : 'hidden md:flex'}`}>
                {selectedJob ? (
                    <div className="flex flex-col h-full relative">
                        {/* Mobile 'Back to List' button */}
                        <div className="md:hidden p-2 border-b flex items-center bg-muted/20">
                            <button
                                onClick={() => setSelectedJobId(null)}
                                className="text-sm font-medium text-blue-600 flex items-center px-2 py-1"
                            >
                                ← Volver a la lista
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ApprovalDetailView
                                job={selectedJob}
                                onProcessed={() => handleJobProcessed(selectedJob.id)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                        <p>Selecciona un trabajo de la lista para ver los detalles</p>
                    </div>
                )}
            </div>
        </div>
    )
}
