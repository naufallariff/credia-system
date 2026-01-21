import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useToast } from '@/shared/hooks/use-toast';

export const useMakePayment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ contractId, month, amount }) => {
            const response = await api.post(`/contracts/${contractId}/payment`, {
                month,
                amount
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            // 1. Refresh specific contract detail
            queryClient.invalidateQueries({ queryKey: ['contract', variables.contractId] });

            // 2. Refresh contracts list
            queryClient.invalidateQueries({ queryKey: ['contracts'] });

            // 3. Refresh dashboard stats (revenue update)
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

            toast({
                title: "Payment Recorded",
                description: `Installment for month ${variables.month} has been paid successfully.`,
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Payment Failed",
                description: error.response?.data?.message || "Transaction could not be processed.",
            });
        }
    });
};