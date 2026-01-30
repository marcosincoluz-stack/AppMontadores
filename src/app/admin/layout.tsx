import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // Check role
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        // If not admin, redirect to installer or unauthorized
        redirect('/installer') // or generic 'unauthorized' page
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    {/* Navigation Links can go here */}
                    <span className="text-sm">Hola, {user.email}</span>
                </div>
            </header>
            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    )
}
