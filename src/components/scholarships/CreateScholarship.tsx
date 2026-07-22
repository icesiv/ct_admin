'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScholarships } from '@/hooks/useScholarships';
import { ScholarshipInput } from '@/types/scholarships';
import ScholarshipForm from '@/components/scholarships/ScholarshipForm';

export default function CreateScholarship() {
    const router = useRouter();
    const { createScholarship } = useScholarships();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: ScholarshipInput) => {
        setIsSubmitting(true);
        try {
            await createScholarship(data);
            router.push('/scholarships');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to save scholarship:\n${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/scholarships');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <ScholarshipForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
            />
        </div>
    );
}
