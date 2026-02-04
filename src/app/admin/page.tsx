import { SectionCards } from "@/components/section-cards"
import { QuickActions } from "@/components/quick-actions"
import { AttentionRequired } from "@/components/attention-required"

export default async function AdminDashboard() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Stats Cards */}
                <SectionCards />

                {/* Quick Actions */}
                <QuickActions />

                {/* Attention Required */}
                <AttentionRequired />
            </div>
        </div>
    )
}
