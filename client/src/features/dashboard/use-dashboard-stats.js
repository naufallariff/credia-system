import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useDashboardStats = (userRole) => {
    return useQuery({
        queryKey: ['dashboard-stats', userRole],
        queryFn: async () => {
            // Parallel Data Fetching for Performance
            const [contractsRes, ticketsRes, usersRes] = await Promise.allSettled([
                api.get('/contracts'),
                api.get('/tickets?status=PENDING'),
                // Only fetch users if Admin/Superadmin
                ['ADMIN', 'SUPERADMIN'].includes(userRole) ? api.get('/users') : Promise.resolve({ data: { data: [] } })
            ]);

            // Safe Data Extraction
            const contracts = contractsRes.status === 'fulfilled' ? (contractsRes.value.data?.data?.contracts || []) : [];
            const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data?.data || []) : [];
            const users = usersRes.status === 'fulfilled' ? (usersRes.value.data?.data || []) : [];

            // Client-side Aggregation (Calculation)
            const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

            const totalPortfolio = activeContracts.reduce((sum, c) => sum + (c.principal_amount || 0), 0);

            const pendingApproval = tickets.length;

            const totalUsers = users.length;

            return {
                activeContractsCount: activeContracts.length,
                totalPortfolioValue: totalPortfolio,
                pendingTicketsCount: pendingApproval,
                totalUsersCount: totalUsers,
                recentContracts: contracts.slice(0, 5) // Get latest 5
            };
        },
        staleTime: 60 * 1000, // Cache data for 1 minute (Performance Optimization)
    });
};