import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axios';

/**
 * Hook to fetch contract list with optional filters.
 * Currently fetches all, prepared for server-side pagination.
 */
export const useContracts = (filters = {}) => {
    return useQuery({
        queryKey: ['contracts', filters],
        queryFn: async () => {
            // In a real scenario, we would pass query params here
            const response = await api.get('/contracts');
            return response.data?.data?.contracts || [];
        },
        staleTime: 30 * 1000, // Cache for 30 seconds
        keepPreviousData: true,
    });
};