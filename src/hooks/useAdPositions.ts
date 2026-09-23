import { useState, useEffect, useCallback } from 'react';
import { Advertisement } from '@/types/ads';

export interface AdPosition {
    key: string;
    label: string;
    description?: string;
    isCustom?: boolean;
}

export const DEFAULT_AD_POSITIONS: AdPosition[] = [
    { key: 'ad-home-top', label: 'Home Top Banner', description: 'Top of home page header' },
    { key: 'ad-home-1', label: 'Home Ad 1', description: 'First home page section' },
    { key: 'ad-home-2', label: 'Home Ad 2', description: 'Second home page section' },
    { key: 'ad-details-1', label: 'Details Ad 1', description: 'Article header / top area' },
    { key: 'ad-details-2', label: 'Details Ad 2', description: 'Inside article body middle' },
    { key: 'ad-details-3', label: 'Details Ad 3', description: 'Inside article body bottom' },
    { key: 'ad-details-4', label: 'Details Ad 4', description: 'Article sidebar / related area' },
];

const STORAGE_KEY = 'ct_ad_positions';
const CUSTOM_EVENT_KEY = 'ct_ad_positions_changed';

export const useAdPositions = (existingAds: Advertisement[] = []) => {
    const [positions, setPositions] = useState<AdPosition[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_AD_POSITIONS;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error reading ad positions from localStorage:', e);
        }
        return DEFAULT_AD_POSITIONS;
    });

    // Save positions to localStorage and trigger sync
    const savePositions = useCallback((newPositions: AdPosition[]) => {
        setPositions(newPositions);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newPositions));
                window.dispatchEvent(new Event(CUSTOM_EVENT_KEY));
            } catch (e) {
                console.error('Error saving ad positions to localStorage:', e);
            }
        }
    }, []);

    // Listen to changes from other components/tabs
    useEffect(() => {
        const handleSync = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setPositions(parsed);
                    }
                }
            } catch (e) {
                console.error('Error syncing ad positions:', e);
            }
        };

        window.addEventListener(CUSTOM_EVENT_KEY, handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener(CUSTOM_EVENT_KEY, handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    // Merge any missing positions found in existing ads
    useEffect(() => {
        if (!existingAds || existingAds.length === 0) return;

        let hasNew = false;
        const currentKeys = new Set(positions.map(p => p.key));
        const updated = [...positions];

        for (const ad of existingAds) {
            if (ad.position && !currentKeys.has(ad.position)) {
                currentKeys.add(ad.position);
                updated.push({
                    key: ad.position,
                    label: ad.position,
                    description: 'Imported from existing ad',
                    isCustom: true
                });
                hasNew = true;
            }
        }

        if (hasNew) {
            savePositions(updated);
        }
    }, [existingAds, positions, savePositions]);

    const addPosition = (newPos: { key: string; label: string; description?: string }): { success: boolean; error?: string } => {
        const trimmedKey = newPos.key.trim().toLowerCase();
        const trimmedLabel = newPos.label.trim();

        if (!trimmedKey) {
            return { success: false, error: 'Position key is required.' };
        }

        // Validate slug characters: letters, numbers, hyphens, underscores
        if (!/^[a-z0-9-_]+$/.test(trimmedKey)) {
            return { success: false, error: 'Position key can only contain letters, numbers, hyphens, and underscores.' };
        }

        if (positions.some(p => p.key.toLowerCase() === trimmedKey)) {
            return { success: false, error: `Position key "${trimmedKey}" already exists.` };
        }

        const positionToAdd: AdPosition = {
            key: trimmedKey,
            label: trimmedLabel || trimmedKey,
            description: newPos.description?.trim() || '',
            isCustom: true
        };

        const updated = [...positions, positionToAdd];
        savePositions(updated);
        return { success: true };
    };

    const updatePosition = (originalKey: string, updatedData: { key: string; label: string; description?: string }): { success: boolean; error?: string } => {
        const trimmedKey = updatedData.key.trim().toLowerCase();
        const trimmedLabel = updatedData.label.trim();

        if (!trimmedKey) {
            return { success: false, error: 'Position key is required.' };
        }

        if (!/^[a-z0-9-_]+$/.test(trimmedKey)) {
            return { success: false, error: 'Position key can only contain letters, numbers, hyphens, and underscores.' };
        }

        if (trimmedKey !== originalKey && positions.some(p => p.key.toLowerCase() === trimmedKey)) {
            return { success: false, error: `Position key "${trimmedKey}" already exists.` };
        }

        const updated = positions.map(pos => {
            if (pos.key === originalKey) {
                return {
                    ...pos,
                    key: trimmedKey,
                    label: trimmedLabel || trimmedKey,
                    description: updatedData.description?.trim() || '',
                };
            }
            return pos;
        });

        savePositions(updated);
        return { success: true };
    };

    const deletePosition = (key: string): boolean => {
        const updated = positions.filter(p => p.key !== key);
        savePositions(updated);
        return true;
    };

    const resetToDefaults = () => {
        savePositions(DEFAULT_AD_POSITIONS);
    };

    return {
        positions,
        addPosition,
        updatePosition,
        deletePosition,
        resetToDefaults,
    };
};
