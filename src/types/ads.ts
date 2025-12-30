export interface Advertisement {
    id: number;
    name: string;
    position: 'home_banner' | 'sidebar_rectangle' | 'article_bottom' | string;
    image_url: string;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    clicks: number;
    impressions: number;
    created_at: string;
}

export interface AdvertisementInput {
    name: string;
    position: string;
    image?: File;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}
