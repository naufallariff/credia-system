import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useDashboardStats = (userRole) => {
    return useQuery({
        queryKey: ['dashboard-stats', userRole],
        queryFn: async () => {
            const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userRole);

            // Parallel Execution for Performance
            const [contractsRes, ticketsRes, usersRes] = await Promise.allSettled([
                api.get('/contracts'),
                api.get('/tickets?status=PENDING'),
                isAdmin ? api.get('/users') : Promise.resolve({ data: { data: [] } })
            ]);

            // Safe Data Extraction (Handling fulfilled state)
            const contracts = contractsRes.status === 'fulfilled' ? (contractsRes.value.data?.data?.contracts || []) : [];
            const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data?.data || []) : [];
            const users = usersRes.status === 'fulfilled' ? (usersRes.value.data?.data || []) : [];

            // Aggregation Logic (Client-side calc)
            const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
            const totalPortfolio = activeContracts.reduce((sum, c) => sum + (c.principal_amount || 0), 0);

            return {
                activeContractsCount: activeContracts.length,
                totalPortfolioValue: totalPortfolio,
                pendingTicketsCount: tickets.length,
                totalUsersCount: users.length,
                recentContracts: contracts.slice(0, 5)
            };
        },
        staleTime: 60 * 1000, // 1 Minute Cache
        keepPreviousData: true // Prevent layout shift during refetch
    });
};