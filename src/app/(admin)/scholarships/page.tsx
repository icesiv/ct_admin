import ScholarshipsManager from '@/components/scholarships/ScholarshipsManager';

export const metadata = {
    title: 'Scholarships Management',
};

export default function ScholarshipsPage() {
    return (
        <div className="min-h-screen">
            <ScholarshipsManager />
        </div>
    );
}
