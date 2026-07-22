export interface Scholarship {
    id: number;
    title: string;
    description: string | null;
    feature_image: string | null;
    published_date: string | null;
    application_deadline: string | null;
    country: string | null;
    degree_level: string | null;
    funding_type: string | null;
    ielts_required: string | null;
    last_verified_date: string | null;
    source: string | null;
    reference_post_id: number | null;
    post?: {
        id: number;
        title: string;
    };
    created_at: string;
    updated_at: string;
}

export interface ScholarshipInput {
    title: string;
    description?: string;
    feature_image?: string | File | null;
    published_date?: string;
    application_deadline?: string;
    country?: string;
    degree_level?: string;
    funding_type?: string;
    ielts_required?: string;
    last_verified_date?: string;
    source?: string;
    reference_post_id?: number | null;
}
