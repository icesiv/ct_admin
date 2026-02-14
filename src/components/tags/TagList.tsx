"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

interface Tag {
    id: number;
    name: string;
    slug: string;
}

export default function TagList() {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTags = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authFetch(`${BASE_URL}tags`);
            if (!response.ok) throw new Error(`Failed to fetch tags: ${response.status}`);
            const data = await response.json();
            setTags(data.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load tags");
            addToast(err.message || "Failed to load tags", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleTagClick = (tagId: number) => {
        router.push(`/topics/${tagId}/edit`);
    };

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-6">

            {/* Search Input */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : error ? (
                <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : filteredTags.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No topics found</div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {filteredTags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => handleTagClick(tag.id)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-600"
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
