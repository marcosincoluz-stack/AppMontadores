import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, Briefcase, Users, CreditCard } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export async function SectionCards() {
    const supabase = await createClient()

    const { count: revisionCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'en_revision')

    const { count: pendingCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: approvedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'installer')

    const cards = [
        {
            title: "Revisiones",
            value: revisionCount || 0,
            description: "Pendientes de aprobación",
            icon: FileCheck,
            href: "/admin/approvals",
            color: "text-red-500",
            bgColor: "bg-red-50 dark:bg-red-950/20"
        },
        {
            title: "Activos",
            value: pendingCount || 0,
            description: "En curso",
            icon: Briefcase,
            href: "/admin/jobs?status=pending",
            color: "text-yellow-500",
            bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
        },
        {
            title: "Por Pagar",
            value: approvedCount || 0,
            description: "Aprobados sin cobrar",
            icon: CreditCard,
            href: "/admin/jobs?status=approved",
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-950/20"
        },
        {
            title: "Equipo",
            value: usersCount || 0,
            description: "Montadores",
            icon: Users,
            href: "/admin/users",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950/20"
        }
    ]

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 px-4 lg:px-6">
            {cards.map((card) => (
                <Link key={card.title} href={card.href}>
                    <Card className={`${card.bgColor} hover:shadow-md transition-shadow cursor-pointer border-0`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
