import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/config/config';
import { Advertisement, AdvertisementInput } from '@/types/ads';
import { useAuth } from '@/context/AuthContext';

export const useAds = () => {
    const { authFetch } = useAuth();
    const queryClient = useQueryClient();

    const fetchAds = async (): Promise<Advertisement[]> => {
        const response = await authFetch(`${BASE_URL}admin/ads`);
        if (!response.ok) throw new Error('Failed to fetch ads');
        const json = await response.json();
        return json.data;
    };

    const createAd = async (data: AdvertisementInput) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('position', data.position);
        if (data.image) formData.append('image', data.image);
        if (data.link_url) formData.append('link_url', data.link_url);
        formData.append('is_active', data.is_active ? '1' : '0');
        if (data.start_date) formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);

        const response = await authFetch(`${BASE_URL}admin/ads`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create ad');
        }
        return response.json();
    };

    const updateAd = async ({ id, data }: { id: number; data: Partial<AdvertisementInput> }) => {
        const formData = new FormData();
        // For update with file upload in Laravel, usually we need POST with _method=PUT depending on server config,
        // but Laravel supports PUT with form-data if using _method field.
        formData.append('_method', 'PUT');

        if (data.name) formData.append('name', data.name);
        if (data.position) formData.append('position', data.position);
        if (data.image) formData.append('image', data.image);
        if (data.link_url) formData.append('link_url', data.link_url);
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.start_date) formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);

        const response = await authFetch(`${BASE_URL}admin/ads/${id}`, {
            method: 'POST', // Use POST for FormData with method spoofing
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update ad');
        }
        return response.json();
    };

    const deleteAd = async (id: number) => {
        const response = await authFetch(`${BASE_URL}admin/ads/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete ad');
    };

    const adsQuery = useQuery({
        queryKey: ['ads'],
        queryFn: fetchAds,
    });

    const createMutation = useMutation({
        mutationFn: createAd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateAd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ads'] });
        },
    });

    return {
        ads: adsQuery.data || [],
        isLoading: adsQuery.isLoading,
        isError: adsQuery.isError,
        createAd: createMutation.mutateAsync,
        updateAd: updateMutation.mutateAsync,
        deleteAd: deleteMutation.mutateAsync,
    };
};
