import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useToast } from '@/shared/hooks/use-toast';

export const useContractActions = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, action, reason }) => {
            const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'VOID';
            const payload = {
                status: newStatus,
                approval_notes: reason || null
            };
            const response = await api.patch(`/contracts/${id}`, payload);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['contract', variables.id]);
            queryClient.invalidateQueries(['contracts']);
            queryClient.invalidateQueries(['dashboard-stats']);

            toast({
                title: variables.action === 'APPROVE' ? "Contract Activated" : "Contract Rejected",
                description: `The contract has been successfully ${variables.action.toLowerCase()}d.`,
                variant: variables.action === 'APPROVE' ? "default" : "destructive",
            });
        },
        onError: (error) => {
            toast({
                title: "Action Failed",
                description: error.response?.data?.message || "Failed to process request.",
                variant: "destructive",
            });
        }
    });
};