import { format } from 'date-fns';
import { MoreHorizontal, ShieldCheck } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { getRoleBadgeColor, getUserStatusColor } from '@/entities/user/ui-mappers';

export const UserTable = ({ users, isLoading }) => {
    if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>User Information</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{user.name}</span>
                                    <span className="text-xs text-slate-500">@{user.username} • {user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getRoleBadgeColor(user.role)} border px-2`}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-sm text-slate-600 capitalize">{user.status.toLowerCase()}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Suspend Account</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};