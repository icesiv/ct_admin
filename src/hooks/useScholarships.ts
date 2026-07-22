import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/config/config';
import { Scholarship, ScholarshipInput } from '@/types/scholarships';
import { useAuth } from '@/context/AuthContext';

export const useScholarships = () => {
    const { authFetch } = useAuth();
    const queryClient = useQueryClient();

    const fetchScholarships = async (): Promise<Scholarship[]> => {
        const response = await authFetch(`${BASE_URL}admin/scholarships`);
        if (!response.ok) throw new Error('Failed to fetch scholarships');
        const json = await response.json();
        // The API returns paginated data (json.data.data) based on the controller structure
        // Let's assume the controller does paginate, so json.data is the paginator. 
        // We'll extract the data array.
        return json.data?.data || json.data || [];
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await authFetch(`${BASE_URL}admin/scholarships/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const json = await response.json();
        return json.image_url;
    };

    const createScholarship = async (data: ScholarshipInput) => {
        const payload = { ...data };
        
        // Handle file upload if it's a file
        if (payload.feature_image instanceof File) {
            payload.feature_image = await uploadImage(payload.feature_image);
        }

        const response = await authFetch(`${BASE_URL}admin/scholarships`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.errors) {
                const messages = Object.values(errorData.errors).flat().join('\n');
                throw new Error(messages);
            }
            throw new Error(errorData.message || 'Failed to create scholarship');
        }
        return response.json();
    };

    const updateScholarship = async ({ id, data }: { id: number; data: Partial<ScholarshipInput> }) => {
        const payload = { ...data };
        
        // Handle file upload if it's a file
        if (payload.feature_image instanceof File) {
            payload.feature_image = await uploadImage(payload.feature_image);
        }

        const response = await authFetch(`${BASE_URL}admin/scholarships/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.errors) {
                const messages = Object.values(errorData.errors).flat().join('\n');
                throw new Error(messages);
            }
            throw new Error(errorData.message || 'Failed to update scholarship');
        }
        return response.json();
    };

    const deleteScholarship = async (id: number) => {
        const response = await authFetch(`${BASE_URL}admin/scholarships/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete scholarship');
    };

    const scholarshipsQuery = useQuery({
        queryKey: ['scholarships'],
        queryFn: fetchScholarships,
    });

    const createMutation = useMutation({
        mutationFn: createScholarship,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateScholarship,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteScholarship,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scholarships'] });
        },
    });

    return {
        scholarships: scholarshipsQuery.data || [],
        isLoading: scholarshipsQuery.isLoading,
        isError: scholarshipsQuery.isError,
        createScholarship: createMutation.mutateAsync,
        updateScholarship: updateMutation.mutateAsync,
        deleteScholarship: deleteMutation.mutateAsync,
    };
};
