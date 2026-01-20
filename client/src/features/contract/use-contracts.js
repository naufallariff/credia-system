import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useContracts = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['contracts', page, limit, search],
        queryFn: async () => {
            // Sending query params to match Backend Controller logic
            const response = await api.get(`/contracts?page=${page}&limit=${limit}&search=${search}`);

            // Default structure to prevent crash if backend response is empty
            return response.data?.data || {
                contracts: [],
                pagination: {
                    current_page: 1,
                    total_pages: 1,
                    has_next: false,
                    has_prev: false
                }
            };
        },
        placeholderData: keepPreviousData, // UX: Keep old data while fetching new page
        staleTime: 5000,
    });
};