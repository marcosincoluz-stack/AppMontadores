import { BottomNav } from '@/components/bottom-nav'

export default function InstallerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-md mx-auto p-4">
                {children}
            </div>
            <BottomNav />
        </div>
    )
}
