import {
    Briefcase,
    TrendingUp,
    FileText,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatRupiah } from '@/entities/contract/model';
import { Skeleton } from '@/shared/ui/skeleton';

export const StatCards = ({ stats, isLoading, userRole }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Total Portfolio",
            value: formatRupiah(stats?.totalPortfolioValue || 0),
            icon: TrendingUp,
            desc: "Outstanding principal amount",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Active Contracts",
            value: stats?.activeContractsCount || 0,
            icon: Briefcase,
            desc: "Loans currently running",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "Pending Approvals",
            value: stats?.pendingTicketsCount || 0,
            icon: FileText,
            desc: "Requires immediate attention",
            color: stats?.pendingTicketsCount > 0 ? "text-amber-600" : "text-slate-500",
            bg: stats?.pendingTicketsCount > 0 ? "bg-amber-50" : "bg-slate-50",
        },
    ];

    // Admin Only Card
    if (['ADMIN', 'SUPERADMIN'].includes(userRole)) {
        cards.push({
            title: "Total Users",
            value: stats?.totalUsersCount || 0,
            icon: Users,
            desc: "Registered system users",
            color: "text-violet-600",
            bg: "bg-violet-50",
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                        <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};