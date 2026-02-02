import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { createClient } from '@/utils/supabase/server'

// Mapped data from DB instead of json file
export default async function Page() {
    const supabase = await createClient()

    // Fetch Jobs for the table
    const { data: jobs } = await supabase
        .from('jobs')
        .select(`
        *,
        users!jobs_assigned_to_fkey (full_name)
    `)
        .order('created_at', { ascending: false })
        .limit(10) // Limit for dashboard view

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive />
                    </div>
                    <DataTable data={jobs || []} />
                </div>
            </div>
        </div>
    )
}
