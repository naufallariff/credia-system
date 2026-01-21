import { useSession } from '@/shared/model/use-session';
import { useDashboardStats } from '@/features/dashboard/use-dashboard-stats';
import { StatCards } from '@/widgets/dashboard/stat-cards';
import { RevenueChart } from '@/widgets/dashboard/revenue-chart';
import { RecentActivity } from '@/widgets/dashboard/recent-activity';
import { Button } from '@/shared/ui/button';
import { PlusCircle } from 'lucide-react';
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
            {/* 1. Header */}
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

            {/* 2. Stats Cards */}
            <section>
                <StatCards stats={stats} isLoading={isLoading} userRole={user?.role} />
            </section>

            {/* 3. Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3): Chart */}
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>

                {/* Right Column (1/3): Activity */}
                <div className="lg:col-span-1">
                    <RecentActivity activities={stats?.recentContracts} />
                </div>
            </div>
        </div>
    );
};