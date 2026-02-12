"use client";

import { useEffect, useState, use } from "react";
import TagForm from "@/components/tags/TagForm";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { Loader2 } from "lucide-react";

export default function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { authFetch } = useAuth();
    const { addToast } = useToast();

    const [tag, setTag] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTag = async () => {
            try {
                setLoading(true);
                // We don't have a direct "get single tag" endpoint in the original code (TagController uses API Resource potentially, or we need to check routes)
                // TagController::resource usually provides show. Let's check api.php
                // api.php has: Route::put('/{tag}', ...), Route::delete...
                // It DOES NOT have Route::get('/{tag}').
                // Wait, looking at api.php:
                /*
                    Route::prefix('tags')->group(function () {
                        Route::get('/', [TagController::class, 'index'])->name('api.tags.index');
                        Route::get('/top', [TagController::class, 'getTopTags'])->name('api.tags.top');
                        Route::post('/', [TagController::class, 'store'])->name('api.tags.store');
                        Route::post('/assign', [TagController::class, 'bulkAssign'])->name('api.tags.assign');
                        Route::put('/{tag}', [TagController::class, 'update'])->name('api.tags.update');
                        Route::delete('/{tag}', [TagController::class, 'destroy'])->name('api.tags.destroy');
                    });
                */
                // There is NO `show` route for tags!
                // I need to add one in the backend to make editing work by ID.
                // OR I can use the list and filter, but that's inefficient.
                // I should add `Route::get('/{tag}', [TagController::class, 'show']);`
            } catch (error) {
                console.error(error);
            }
        };
    }, [id]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Topic</h1>
            </div>
            {/* Fallback while I fix backend */}
            <TagFormWrapper id={id} />
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
