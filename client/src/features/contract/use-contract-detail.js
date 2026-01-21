import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/axios';

export const useContractDetail = (contractId) => {
    // Priority: Argument ID -> URL Params ID
    const { id: paramId } = useParams();
    const id = contractId || paramId;

    return useQuery({
        queryKey: ['contract', id],
        queryFn: async () => {
            const response = await api.get(`/contracts/${id}`);
            return response.data?.data || null;
        },
        enabled: !!id,
        staleTime: 60 * 1000,
    });
};