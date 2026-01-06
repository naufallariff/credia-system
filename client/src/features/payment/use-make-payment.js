import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useToast } from '@/shared/hooks/use-toast';

export const useMakePayment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ contractId, month, amount }) => {
            // Endpoint: POST /api/contracts/:id/payment
            const response = await api.post(`/contracts/${contractId}/payment`, {
                month,
                amount
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate specific contract to refresh the schedule UI
            queryClient.invalidateQueries(['contract', variables.contractId]);
            // Invalidate dashboard stats to reflect revenue
            queryClient.invalidateQueries(['dashboard-stats']);

            toast({
                title: "Payment Recorded",
                description: `Installment for month ${variables.month} has been paid successfully.`,
            });
        },
        onError: (error) => {
            toast({
                title: "Payment Failed",
                description: error.response?.data?.message || "Transaction could not be processed.",
                variant: "destructive",
            });
        }
    });
};