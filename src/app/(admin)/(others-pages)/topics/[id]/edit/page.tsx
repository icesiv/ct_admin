"use client";

import { useEffect, useState, use } from "react";
import TagForm from "@/components/tags/TagForm";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this topic? This action cannot be undone.")) return;

        try {
            setIsDeleting(true);
            const response = await authFetch(`${BASE_URL}tags/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete topic");
            }

            addToast("Topic deleted successfully", "success");
            router.push("/topics");
        } catch (error: any) {
            console.error(error);
            addToast(error.message || "Failed to delete topic", "error");
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Topic</h1>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : <Trash2 size={20} />}
                    <span>Delete Topic</span>
                </button>
            </div>
            {/* Fallback while I fix backend */}
            {!isDeleting && <TagFormWrapper id={id} />}
        </div>
    );
}

function TagFormWrapper({ id }: { id: string }) {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const [tag, setTag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTag = async () => {
            try {
                // Trying to fetch from /tags/{id}
                const response = await authFetch(`${BASE_URL}tags/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTag(data.data);
                } else {
                    // If standard show doesn't exist, we might have to fetch all and find?
                    // Or assume the user will fix the backend.
                    // I will add the backend route now.
                    throw new Error("Failed to fetch tag details");
                }
            } catch (err: any) {
                setError(err.message);
                addToast("Error fetching tag details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchTag();
    }, [id, authFetch, addToast]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return <TagForm initialData={tag} />;
}
