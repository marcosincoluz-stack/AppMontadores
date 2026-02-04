"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

import { NotificationsBtn } from "./notifications-btn"

export function SiteHeader() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    return (
        <header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.length > 1 && <BreadcrumbSeparator className="hidden md:block" />}
                        {segments.slice(1).map((segment, index) => (
                            <BreadcrumbItem key={segment} className="hidden md:block">
                                {index === segments.slice(1).length - 1 ? (
                                    <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={`/admin/${segment}`} className="capitalize">{segment}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="mr-4">
                <NotificationsBtn />
            </div>
        </header>
    )
}
