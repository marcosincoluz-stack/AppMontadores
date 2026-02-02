import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function InstallerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // We could strictly enforce 'installer' role here, 
    // but if you are authenticated and not admin, you are effectively an installer in this simple app.
    // However, strict check is better.
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role === 'admin') {
        // Admins can probably view installer view too, or redirect to admin
        // For now, let's keep them separate
        redirect('/admin')
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-1 p-4">
                {children}
            </main>
        </div>
    )
}
