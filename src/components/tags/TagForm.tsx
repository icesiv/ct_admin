"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Loader2 } from "lucide-react";
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

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setMetaTitle(initialData.meta_title || "");
            setMetaDescription(initialData.meta_description || "");
            setOgImage(initialData.og_image || "");
        }
    }, [initialData]);

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
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save tag");
            }

            addToast(initialData ? "Tag updated successfully!" : "Tag created successfully!", "success");

            if (onSuccess) {
                onSuccess();
            } else {
                // Default behavior: redirect to list or reset form
                if (!initialData) {
                    setName("");
                    setSlug("");
                    setMetaTitle("");
                    setMetaDescription("");
                    setOgImage("");
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
                    </div>

                    {/* Right Column: SEO & Image */}
                    <div className="space-y-4">
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

                        <div>
                            <FeatureImageUploader
                                featured_image={ogImage}
                                title="OG Image (Optional)"
                                OpenModal={OpenModal}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        disabled={loading || !name.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {initialData ? "Updating..." : "Adding..."}
                            </>
                        ) : (
                            <>
                                {initialData ? <Edit3 size={16} /> : <Plus size={16} />}
                                {initialData ? "Update" : "Add Topic"}
                            </>
                        )}
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
