"use client"

import * as React from "react"
import {
    Briefcase,
    GalleryVerticalEnd,
    Settings2,
    SquareTerminal,
    Users,
    FileCheck
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "Admin",
        email: "admin@admin.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Sign Installer App",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
    ],
    navMain: [
        {
            title: "Gestión",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "Trabajos Activos",
                    url: "/admin/jobs",
                    icon: Briefcase,
                },
                {
                    title: "Revisiones",
                    url: "/admin/approvals",
                    icon: FileCheck,
                },
                {
                    title: "Montadores",
                    url: "/admin/users",
                    icon: Users,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Sign App</span>
                                    <span className="truncate text-xs">Admin Panel</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* We build the menu manually for now to align with our routes */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard">
                            <a href="/admin">
                                <SquareTerminal />
                                <span>Dashboard</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Trabajos">
                            <a href="/admin/jobs">
                                <Briefcase />
                                <span>Trabajos</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Revisiones">
                            <a href="/admin/approvals">
                                <FileCheck />
                                <span>Revisiones</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Montadores">
                            <a href="/admin/users">
                                <Users />
                                <span>Montadores</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                {/* User menu placeholder */}
                <div className="p-2 text-xs text-gray-500 text-center">
                    Admin User
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
