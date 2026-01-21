import { useSession } from '@/shared/model/use-session';
import { useDashboardStats } from '@/features/dashboard/use-dashboard-stats';
import { StatCards } from '@/widgets/dashboard/stat-cards';
import { Button } from '@/shared/ui/button';
import { PlusCircle, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
    const { user } = useSession();
    const navigate = useNavigate();

    const { data: stats, isLoading, isError } = useDashboardStats(user?.role);

    if (isError) {
        return (
            <div className="p-6 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                Failed to load dashboard data. Please check your connection.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="font-semibold text-primary">{user?.name}</span>.
                    </p>
                </div>

                {['STAFF', 'ADMIN', 'SUPERADMIN'].includes(user?.role) && (
                    <Button onClick={() => navigate('/contracts/new')} className="shadow-lg shadow-primary/20">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Application
                    </Button>
                )}
            </div>

            {/* 2. Key Performance Indicators */}
            <section>
                <StatCards stats={stats} isLoading={isLoading} userRole={user?.role} />
            </section>

            {/* 3. Secondary Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reduced height to make it look tighter */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border h-[200px] flex flex-col items-center justify-center text-muted-foreground shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20 pointer-events-none" />
                    <BarChart3 className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-sm">Revenue Analytics</p>
                    <p className="text-[10px] opacity-70">(Coming Soon in Phase 2)</p>
                </div>
                <div className="bg-card rounded-xl border border-border h-[200px] flex flex-col items-center justify-center text-muted-foreground shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20 pointer-events-none" />
                    <Activity className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-sm">Recent Activity Log</p>
                    <p className="text-[10px] opacity-70">(Coming Soon in Phase 2)</p>
                </div>
            </div>
        </div>
    );
};