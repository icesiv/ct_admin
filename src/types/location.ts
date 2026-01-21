export interface Division {
    id: number;
    name: string;
    slug: string;
}

export interface District {
    id: number;
    division_id: number;
    name: string;
    slug: string;
}

// Ensure you have a Post interface defined somewhere, or define it here if needed
export interface Post {
    id: number;
    title: string;
    slug: string;
    featured_image: string;
    created_at: string;
    view_count: number;
    categories: { id: number, name: string }[];
    districts: { id: number, name: string }[];
    user: { id: number, name: string };
}
