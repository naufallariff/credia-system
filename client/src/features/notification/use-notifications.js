import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            try {
                const response = await api.get('/notifications');
                return response.data?.data || [];
            } catch (error) {
                // Return empty array to prevent UI crash on notification service failure
                return [];
            }
        },
        refetchInterval: 30000, // Poll every 30s
        staleTime: 10000,
        initialData: [],
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

export const useMarkAllRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};