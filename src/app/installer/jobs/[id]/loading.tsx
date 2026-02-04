import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center text-sm text-gray-300 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <Skeleton className="h-4 w-32" />
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4 border-t">
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}
