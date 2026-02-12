import TagBulkAssign from "@/components/tags/TagBulkAssign";

export const metadata = {
    title: "Bulk Assign Topics | Campus Times Admin",
    description: "Bulk assign topics to posts",
};

export default function BulkAssignPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bulk Assign Topics</h1>
            </div>
            <TagBulkAssign />
        </div>
    );
}
