"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Loader2, Search, X, ArrowLeft, Save } from "lucide-react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { FeatureImageUploader } from "@/components/editor/FeatureUploader";
import ImageUploaderModal, { ImageData } from "@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal";
import { useRouter } from "next/navigation";

interface Tag {
    id: number;
    name: string;
    slug: string;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    related_tags?: Tag[];
}

interface TagFormProps {
    initialData?: Tag | null;
    onSuccess?: () => void;
}

export default function TagForm({ initialData, onSuccess }: TagFormProps) {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
    const [ogImage, setOgImage] = useState(initialData?.og_image || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitAction, setSubmitAction] = useState<'save' | 'saveAndBack'>('save');

    // Related Tags State
    const [relatedTags, setRelatedTags] = useState<Tag[]>(initialData?.related_tags || []);
    const [tagSearchTerm, setTagSearchTerm] = useState("");
    const [foundTags, setFoundTags] = useState<Tag[]>([]);
    const [searchingTags, setSearchingTags] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setMetaTitle(initialData.meta_title || "");
            setMetaDescription(initialData.meta_description || "");
            setOgImage(initialData.og_image || "");
            setRelatedTags(initialData.related_tags || []);
        }
    }, [initialData]);

    // Search Tags
    useEffect(() => {
        const searchTags = async () => {
            if (!tagSearchTerm.trim()) {
                setFoundTags([]);
                return;
            }

            setSearchingTags(true);
            try {
                const response = await authFetch(`${BASE_URL}tags`);
                if (response.ok) {
                    const result = await response.json();
                    const allTags = result.data || [];
                    const filtered = allTags.filter((t: Tag) =>
                        t.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
                        t.id !== initialData?.id && // Exclude self
                        !relatedTags.some(rt => rt.id === t.id) // Exclude already selected
                    );
                    setFoundTags(filtered.slice(0, 5)); // Limit to 5
                }
            } catch (error) {
                console.error("Error searching tags:", error);
            } finally {
                setSearchingTags(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchTags();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [tagSearchTerm, initialData?.id, relatedTags]);

    const handleAddRelatedTag = (tag: Tag) => {
        setRelatedTags([...relatedTags, tag]);
        setTagSearchTerm("");
        setFoundTags([]);
    };

    const handleRemoveRelatedTag = (tagId: number) => {
        setRelatedTags(relatedTags.filter(t => t.id !== tagId));
    };

    const handleImageSelect = (image: ImageData) => {
        setOgImage(image.url);
        setIsModalOpen(false);
    };

    const OpenModal = (flag: boolean) => setIsModalOpen(flag);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const url = initialData
                ? `${BASE_URL}tags/${initialData.id}`
                : `${BASE_URL}tags`;

            const method = initialData ? "PUT" : "POST";

            const response = await authFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    slug: slug.trim() || undefined,
                    meta_title: metaTitle.trim() || undefined,
                    meta_description: metaDescription.trim() || undefined,
                    og_image: ogImage || undefined,
                    related_tags: relatedTags.map(t => t.id)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save tag");
            }

            addToast(initialData ? "Topic updated successfully!" : "Topic created successfully!", "success");

            if (onSuccess) {
                onSuccess();
            } else {
                if (submitAction === 'saveAndBack') {
                    router.push('/topics');
                } else {
                    // Default behavior for "Update/Add": stay or reset
                    if (!initialData) {
                        setName("");
                        setSlug("");
                        setMetaTitle("");
                        setMetaDescription("");
                        setOgImage("");
                        setRelatedTags([]);
                    }
                }
            }
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {initialData ? "Edit Topic" : "Add New Topic"}
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter topic name"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={loading}
                                required
                                minLength={1}
                                maxLength={255}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="SEO Title (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={loading}
                                maxLength={255}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                            <textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="SEO Description (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                rows={3}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Right Column: SEO & Image */}
                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="Enter slug (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={loading}
                                minLength={1}
                                maxLength={255}
                            />
                        </div>

                        <div>
                            <FeatureImageUploader
                                featured_image={ogImage}
                                title="OG Image (Optional)"
                                OpenModal={OpenModal}
                            />
                        </div>

                        {/* Related Topics Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Related Topics</label>

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {relatedTags.map(tag => (
                                    <span key={tag.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {tag.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRelatedTag(tag.id)}
                                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 focus:outline-none"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={tagSearchTerm}
                                    onChange={(e) => setTagSearchTerm(e.target.value)}
                                    placeholder="Search related topics..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                    disabled={loading}
                                />
                                {searchingTags && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Loader2 size={16} className="text-gray-400 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {tagSearchTerm && foundTags.length > 0 && (
                                <div className="absolute z-10 w-full max-w-xl mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {foundTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => handleAddRelatedTag(tag)}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-2"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        onClick={() => setSubmitAction('saveAndBack')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        disabled={loading || !name.trim()}
                    >
                        {loading && submitAction === 'saveAndBack' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ArrowLeft size={16} />
                        )}
                        {initialData ? "Update & Back" : "Add & Back"}
                    </button>

                    <button
                        type="submit"
                        onClick={() => setSubmitAction('save')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        disabled={loading || !name.trim()}
                    >
                        {loading && submitAction === 'save' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            initialData ? <Edit3 size={16} /> : <Plus size={16} />
                        )}
                        {initialData ? "Update" : "Add"}
                    </button>
                </div>
            </form>

            <ImageUploaderModal
                isOpen={isModalOpen}
                OpenModal={OpenModal}
                callback={handleImageSelect}
                uploadEndpoint="admin/images/upload-image/gallery"
                fetchEndpoint="admin/images/upload-image/gallery"
            />
        </div>
    );
}
