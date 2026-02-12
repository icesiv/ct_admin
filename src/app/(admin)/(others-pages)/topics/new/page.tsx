import TagForm from "@/components/tags/TagForm";

export const metadata = {
    title: "New Topic | Campus Times Admin",
    description: "Create a new topic",
};

export default function NewTopicPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Topic</h1>
            </div>
            <TagForm />
        </div>
    );
}
