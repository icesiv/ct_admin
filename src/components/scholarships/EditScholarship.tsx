'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useScholarships } from '@/hooks/useScholarships';
import { ScholarshipInput, Scholarship } from '@/types/scholarships';
import ScholarshipForm from '@/components/scholarships/ScholarshipForm';

export default function EditScholarship() {
    const router = useRouter();
    const params = useParams();
    const { scholarships, updateScholarship, isLoading } = useScholarships();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<Scholarship | null>(null);

    const scholarshipId = params?.id ? parseInt(params.id as string) : null;

    useEffect(() => {
        if (scholarships.length > 0 && scholarshipId) {
            const found = scholarships.find((s) => s.id === scholarshipId);
            if (found) {
                setInitialData(found);
            } else {
                // Not found locally, maybe redirect or show error.
                // In a real app we might fetch the specific scholarship if not in the list
                console.error("Scholarship not found");
                router.push('/scholarships');
            }
        }
    }, [scholarships, scholarshipId, router]);

    const handleSubmit = async (data: ScholarshipInput) => {
        if (!scholarshipId) return;
        
        setIsSubmitting(true);
        try {
            await updateScholarship({ id: scholarshipId, data });
            router.push('/scholarships');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to update scholarship:\n${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/scholarships');
    };

    if (isLoading && !initialData) {
        return <div className="p-8 text-center">Loading scholarship...</div>;
    }

    if (!initialData) {
        return <div className="p-8 text-center">Scholarship not found.</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <ScholarshipForm
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
            />
        </div>
    );
}
