import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/axios";

export const useClients = () => {
    return useQuery({
        queryKey: ["users"], // Share cache with useUsers if endpoint is same
        queryFn: async () => {
            const response = await api.get("/users");
            return response.data?.data || [];
        },
        // Transformation happens here.
        // This is memoized and only runs if data changes.
        select: (data) => data.filter((u) => u.role === "CLIENT"),
        staleTime: 60 * 1000,
    });
};
