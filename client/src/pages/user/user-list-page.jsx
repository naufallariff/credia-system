import { Shield } from 'lucide-react';
import { useUsers } from '@/features/user/use-users';
import { UserTable } from '@/widgets/user/user-table';
import { CreateUserDialog } from '@/widgets/user/create-user-dialog';

export const UserListPage = () => {
    const { data: users, isLoading } = useUsers();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-500/15 rounded-lg text-violet-600 dark:text-violet-400 border border-violet-500/10">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
                        <p className="text-muted-foreground text-sm">Control system access and manage staff roles.</p>
                    </div>
                </div>

                <CreateUserDialog />
            </div>

            <UserTable users={users || []} isLoading={isLoading} />
        </div>
    );
};