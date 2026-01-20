import axios from 'axios';
// Remove trailing slash from API_URL to prevent double slashes
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
};

// Cache helper functions
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData<T> {
    data: T;
    timestamp: number;
}

const getCached = <T>(key: string): T | null => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp }: CachedData<T> = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired
        if (now - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error reading cache for ${key}:`, error);
        return null;
    }
};

const setCached = <T>(key: string, data: T): void => {
    try {
        const cacheData: CachedData<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error(`Error setting cache for ${key}:`, error);
    }
};

export const LocationService = {
    getDivisions: async () => {
        const cacheKey = 'location:divisions';

        // Try to get from cache first
        const cached = getCached<any[]>(cacheKey);
        if (cached) {
            console.log('Returning cached divisions');
            return cached;
        }

        // If not in cache, fetch from API
        console.log('Fetching divisions from API');
        try {
            const response = await axios.get(`${API_URL}/admin/location/divisions`, getHeaders());
            const data = response.data;

            // Store in cache
            setCached(cacheKey, data);

            return data;
        } catch (error) {
            console.error('Error fetching divisions:', error);
            throw error;
        }
    },

    getDistricts: async (divisionId?: number) => {
        const cacheKey = divisionId
            ? `location:districts:division:${divisionId}`
            : 'location:districts:all';

        // Try to get from cache first
        const cached = getCached<any[]>(cacheKey);
        if (cached) {
            console.log(`Returning cached districts for ${divisionId ? `division ${divisionId}` : 'all'}`);
            return cached;
        }

        // If not in cache, fetch from API
        console.log(`Fetching districts from API for ${divisionId ? `division ${divisionId}` : 'all'}`);
        const url = divisionId
            ? `${API_URL}/admin/location/districts/${divisionId}`
            : `${API_URL}/admin/location/districts`;

        try {
            const response = await axios.get(url, getHeaders());
            const data = response.data;

            // Store in cache
            setCached(cacheKey, data);

            return data;
        } catch (error) {
            console.error('Error fetching districts:', error);
            throw error;
        }
    },

    getPostsByDivision: async (divisionId: number, page = 1) => {
        // Posts change frequently, so we don't cache them
        const response = await axios.get(`${API_URL}/admin/location/posts/division/${divisionId}?page=${page}`, getHeaders());
        return response.data;
    },

    getPostsByDistrict: async (districtId: number, page = 1) => {
        // Posts change frequently, so we don't cache them
        const response = await axios.get(`${API_URL}/admin/location/posts/district/${districtId}?page=${page}`, getHeaders());
        return response.data;
    },

    // Helper method to clear cache if needed (e.g., for admin operations)
    clearCache: () => {
        const keys = ['location:divisions', 'location:districts:all'];
        keys.forEach(key => localStorage.removeItem(key));

        // Clear division-specific district caches (pattern-based)
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('location:districts:division:')) {
                localStorage.removeItem(key);
            }
        });

        console.log('Location cache cleared');
    }
};
