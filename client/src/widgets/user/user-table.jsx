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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

// Helper for Initials
const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'U';

// Badge Styles with Opacity (Modern Look)
const getRoleBadgeStyle = (role) => {
    switch (role) {
        case 'SUPERADMIN': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900';
        case 'ADMIN': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900';
        case 'STAFF': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900';
        default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
};

export const UserTable = ({ users, isLoading }) => {
    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading user directory...</div>;

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="w-[300px]">User Profile</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Joined Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-muted/30 border-border transition-colors">
                            {/* 1. User Profile with Avatar */}
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-border">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                            {/* Pastikan helper getInitials ada */}
                                            {user.name?.substring(0, 2).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground text-sm leading-none mb-1">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* 2. Role Badge */}
                            <TableCell>
                                <Badge className={`${getRoleBadgeStyle(user.role)} border shadow-none px-2.5 rounded-md`}>
                                    {user.role}
                                </Badge>
                            </TableCell>

                            {/* 3. Status Indicator */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`relative flex h-2.5 w-2.5`}>
                                        {user.status === 'ACTIVE' && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                                    </span>
                                    <span className="text-sm font-medium text-foreground capitalize">{user.status.toLowerCase()}</span>
                                </div>
                            </TableCell>

                            {/* 4. Date */}
                            <TableCell className="text-right text-muted-foreground text-sm font-mono">
                                {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '-'}
                            </TableCell>

                            {/* 5. Actions */}
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Reset Password</DropdownMenuItem>

                                        <DropdownMenuSeparator />

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