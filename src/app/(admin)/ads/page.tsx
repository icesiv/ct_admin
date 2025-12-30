import AdsManager from '@/components/ads/AdsManager';

export const metadata = {
    title: 'Ad Manager',
};

export default function AdsPage() {
    return (
        <div className="min-h-screen">
            <AdsManager />
        </div>
    );
}
