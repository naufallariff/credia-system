import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useSession } from '@/shared/model/use-session';

export const useClientPortfolio = () => {
    const { user } = useSession();

    return useQuery({
        queryKey: ['client-portfolio', user?._id],
        queryFn: async () => {
            // Note: In production, specific endpoint like /api/client/my-contracts is preferred
            const response = await api.get('/contracts');
            const allContracts = response.data?.data?.contracts || [];

            const myContracts = allContracts.filter(c => c.client?._id === user?._id);

            // Calculate Summary Stats
            const activeContract = myContracts.find(c => c.status === 'ACTIVE');
            let totalRemaining = 0;
            let nextDueDate = null;

            if (activeContract) {
                const unpaidSchedules = activeContract.amortization.filter(s => s.status !== 'PAID');
                totalRemaining = unpaidSchedules.reduce((sum, item) => sum + item.amount, 0);

                const nextBill = unpaidSchedules.find(s => s.status !== 'PAID');
                nextDueDate = nextBill ? nextBill.due_date : null;
            }

            return {
                contracts: myContracts,
                activeContract,
                summary: {
                    totalLoans: myContracts.length,
                    remainingDebt: totalRemaining,
                    nextDueDate
                }
            };
        },
        enabled: !!user?._id,
        staleTime: 60 * 1000
    });
};