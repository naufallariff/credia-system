import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios';
import { useToast } from '@/shared/hooks/use-toast';

// 1. Fetch All Users
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'], // Standardized key
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data?.data || [];
        },
        staleTime: 60 * 1000,
    });
};

// 2. Create New User Mutation
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (userData) => {
            // Ensure endpoint matches backend route (e.g., /users or /auth/register)
            const response = await api.post('/auth/register', userData);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate 'users' query to refetch list automatically
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: "User Created",
                description: "New account has been successfully registered."
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error.response?.data?.message || "Failed to create user"
            });
        }
    });
};