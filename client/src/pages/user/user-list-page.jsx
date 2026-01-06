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
                    <div className="p-3 bg-violet-100 rounded-lg text-violet-700">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 text-sm">Control system access and manage staff roles.</p>
                    </div>
                </div>

                {/* Create Action */}
                <CreateUserDialog />
            </div>

            {/* Data Grid */}
            <UserTable users={users || []} isLoading={isLoading} />
        </div>
    );
};