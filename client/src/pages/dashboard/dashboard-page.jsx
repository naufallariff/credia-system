import { useSession } from '@/shared/model/use-session';
import { useDashboardStats } from '@/features/dashboard/use-dashboard-stats';
import { StatCards } from '@/widgets/dashboard/stat-cards';
import { Button } from '@/shared/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
    const { user } = useSession();
    const navigate = useNavigate();

    // Use Custom Hook for Data Fetching
    const { data: stats, isLoading, isError } = useDashboardStats(user?.role);

    if (isError) {
        return (
            <div className="p-6 text-red-500 bg-red-50 rounded-lg border border-red-200">
                Failed to load dashboard data. Please check your connection.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500">
                        Welcome back, <span className="font-semibold text-primary">{user?.name}</span>. Here is what's happening today.
                    </p>
                </div>

                {/* Quick Actions (Staff Only) */}
                {['STAFF', 'ADMIN', 'SUPERADMIN'].includes(user?.role) && (
                    <Button onClick={() => navigate('/contracts/new')} className="shadow-lg shadow-primary/20">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Application
                    </Button>
                )}
            </div>

            {/* 2. Key Performance Indicators (Widgets) */}
            <section>
                <StatCards stats={stats} isLoading={isLoading} userRole={user?.role} />
            </section>

            {/* 3. Secondary Content Area (Placeholder for Next Step) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 h-64 flex items-center justify-center text-slate-400 border-dashed">
                    Chart Visualization Widget (Coming Soon)
                </div>
                <div className="bg-white rounded-xl border border-slate-200 h-64 flex items-center justify-center text-slate-400 border-dashed">
                    Recent Activity Widget (Coming Soon)
                </div>
            </div>
        </div>
    );
};