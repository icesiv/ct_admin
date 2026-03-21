import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };
};

export interface SpacialData {
    show_spacial?: boolean | number;
    show_news?: boolean | number;
    title?: string;
    banner_d?: string;
    banner_m?: string;
    news_1_id?: number | string;
    news_2_id?: number | string;
    news_3_id?: number | string;
    news_4_id?: number | string;
    news_5_id?: number | string;
    more_type?: string;
    more_value?: string;
    theme_color?: string;
}

export const SpacialService = {
    getSettings: async () => {
        const response = await axios.get(`${API_URL}/admin/spacial`, getHeaders());
        return response.data;
    },

    updateSettings: async (data: SpacialData) => {
        const response = await axios.post(`${API_URL}/admin/spacial`, data, getHeaders());
        return response.data;
    },

    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_URL}/admin/spacial/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });
        return response.data;
    }
};
