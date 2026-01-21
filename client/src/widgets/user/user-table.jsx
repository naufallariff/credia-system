import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
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

// Update warna badge agar ramah dark mode
const getRoleBadgeStyle = (role) => {
    switch (role) {
        case 'SUPERADMIN': return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20';
        case 'ADMIN': return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20';
        case 'STAFF': return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20';
        default: return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20';
    }
};

export const UserTable = ({ users, isLoading }) => {
    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;

    return (
        <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-muted-foreground">User Information</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Joined Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/50 border-border transition-colors">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">@{user.username} • {user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getRoleBadgeStyle(user.role)} border px-2 shadow-none hover:bg-transparent`}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                                    <span className="text-sm text-muted-foreground capitalize">{user.status.toLowerCase()}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Suspend Account</DropdownMenuItem>
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