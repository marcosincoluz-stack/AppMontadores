'use client'

import { Home, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + '/')
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background h-16 flex items-center justify-around z-50 pb-safe">
            <Link
                href="/installer"
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/installer' || pathname.startsWith('/installer/jobs')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary/70'
                    }`}
            >
                <Home className="h-6 w-6" />
                <span className="text-[10px] font-medium">Mis Trabajos</span>
            </Link>

            <Link
                href="/installer/profile"
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/installer/profile')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary/70'
                    }`}
            >
                <User className="h-6 w-6" />
                <span className="text-[10px] font-medium">Perfil</span>
            </Link>
        </div>
    )
}
