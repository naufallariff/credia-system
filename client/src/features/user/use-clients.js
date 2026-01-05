import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axios';

export const useClients = () => {
    return useQuery({
        queryKey: ['users', 'client'],
        queryFn: async () => {
            const response = await api.get('/users');
            const users = response.data?.data || [];
            // Filter hanya user dengan role CLIENT
            return users.filter(u => u.role === 'CLIENT');
        },
        staleTime: 60 * 1000,
    });
};