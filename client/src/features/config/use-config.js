import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useToast } from '@/shared/hooks/use-toast';

// Fetch Global Configuration
export const useConfig = () => {
    return useQuery({
        queryKey: ['global-config'],
        queryFn: async () => {
            const response = await api.get('/config');
            return response.data?.data || {};
        },
        staleTime: 5 * 60 * 1000,
    });
};

// Update Configuration
export const useUpdateConfig = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.put('/config', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['global-config']);
            toast({
                title: "Settings Saved",
                description: "Global system configuration has been updated."
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.response?.data?.message || "Could not save settings."
            });
        }
    });
};