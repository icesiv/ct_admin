export interface AdvertisementConfig {
    type?: string;
    layout?: string;
    breakpoint?: string;
    defaultWidth?: string;
    defaultHeight?: string;
    containerClass?: string;
    srcMobile?: string;
    srcDesktop?: string;
}

export interface Advertisement {
    id: number;
    name: string;
    position: 'home_banner' | 'sidebar_rectangle' | 'article_bottom' | string;
    image_url: string;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    config?: AdvertisementConfig;
}

export interface AdvertisementInput {
    name: string;
    position: string;
    image?: File;
    mobile_image?: File;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    config?: AdvertisementConfig;
}
