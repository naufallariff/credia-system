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
                    <Skeleton key={i} className="h-32 rounded-xl bg-muted" />
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
            color: "text-blue-500",
            bg: "bg-blue-500/10", // Opacity approach for dark mode compat
        },
        {
            title: "Active Contracts",
            value: stats?.activeContractsCount || 0,
            icon: Briefcase,
            desc: "Loans currently running",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Pending Approvals",
            value: stats?.pendingTicketsCount || 0,
            icon: FileText,
            desc: "Requires immediate attention",
            color: stats?.pendingTicketsCount > 0 ? "text-amber-500" : "text-muted-foreground",
            bg: stats?.pendingTicketsCount > 0 ? "bg-amber-500/10" : "bg-muted",
        },
    ];

    // Admin Only Card
    if (['ADMIN', 'SUPERADMIN'].includes(userRole)) {
        cards.push({
            title: "Total Users",
            value: stats?.totalUsersCount || 0,
            icon: Users,
            desc: "Registered system users",
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <Card key={idx} className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};