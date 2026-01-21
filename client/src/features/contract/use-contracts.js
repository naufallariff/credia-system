import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useContracts = (page = 1, limit = 10, search = '') => {
    return useQuery({
        queryKey: ['contracts', page, limit, search],
        queryFn: async () => {
            const response = await api.get(`/contracts?page=${page}&limit=${limit}&search=${search}`);

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
        placeholderData: keepPreviousData,
        staleTime: 5000,
    });
};