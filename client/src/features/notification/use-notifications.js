import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';

// Fetch Notifications with Polling
export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            // Assuming GET /notifications returns list sorted by date desc
            const response = await api.get('/notifications');
            return response.data?.data || [];
        },
        // Poll every 30 seconds to simulate real-time updates
        refetchInterval: 30000,
        staleTime: 10000,
    });
};

// Mark as Read Mutation
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            // Assuming PATCH /notifications/:id/read endpoint
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            // Refresh list immediately after marking as read
            queryClient.invalidateQueries(['notifications']);
        }
    });
};

// Mark ALL as Read Mutation
export const useMarkAllRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.patch('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });
};