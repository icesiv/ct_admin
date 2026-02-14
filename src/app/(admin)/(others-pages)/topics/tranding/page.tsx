import TrendingTagManager from "@/components/tags/TrendingTagManager";

export const metadata = {
    title: "Trending Topics | Campus Times Admin",
    description: "Manage trending topics order",
};

export default function TrendingTopicsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Trending Topics</h1>
            </div>
            <TrendingTagManager />
        </div>
    );
}
