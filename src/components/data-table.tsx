"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function DataTable({ data }: { data: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Últimos Trabajos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.client_name}</TableCell>
                                <TableCell>
                                    {(job.users as any)?.full_name || 'Sin asignar'}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${job.status === 'en_revision' ? 'bg-blue-100 text-blue-800' : ''}
                    ${job.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${job.status === 'paid' ? 'bg-gray-100 text-gray-800' : ''}
                   `}>
                                        {job.status === 'pending' && 'Pendiente'}
                                        {job.status === 'en_revision' && 'En Revisión'}
                                        {job.status === 'approved' && 'Aprobado'}
                                        {job.status === 'paid' && 'Pagado'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {job.amount ? `${job.amount} €` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!data || data.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                    No hay datos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
