"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Loader2, Search, X, ArrowLeft, Save, Trash2 } from "lucide-react";
import Switch from "@/components/form/switch/Switch";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { FeatureImageUploader } from "@/components/editor/FeatureUploader";
import ImageUploaderModal, { ImageData } from "@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal";
import { useRouter } from "next/navigation";

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number;
    position: number;
    active: boolean;
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    children?: Category[];
}

interface CategoryFormProps {
    initialData?: Category | null;
    onSuccess?: () => void;
}

export default function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [parentId, setParentId] = useState<number>(initialData?.parent_id || 0);
    const [position, setPosition] = useState<number>(initialData?.position || 1);
    const [active, setActive] = useState<boolean>(initialData?.active ?? true);
    const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
    const [ogImage, setOgImage] = useState(initialData?.og_image || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitAction, setSubmitAction] = useState<'save' | 'saveAndBack'>('save');

    // Categories for Parent Selection
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSlug(initialData.slug);
            setParentId(initialData.parent_id || 0);
            setPosition(initialData.position || 1);
            setActive(initialData.active ?? true);
            setMetaTitle(initialData.meta_title || "");
            setMetaDescription(initialData.meta_description || "");
            setOgImage(initialData.og_image || "");
        }
    }, [initialData]);

    useEffect(() => {
        fetchParentCategories();
    }, []);

    const fetchParentCategories = async () => {
        try {
            const response = await authFetch(`${BASE_URL}admin/categories`);
            if (response.ok) {
                const data = await response.json();
                // Filter to only show root categories or categories that are not the current one (to avoid circular dependency)
                const safeCategories = data.data.filter((c: Category) => c.parent_id === 0 && c.id !== initialData?.id);
                setCategories(safeCategories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleImageSelect = (image: ImageData) => {
        setOgImage(image.url);
        setIsModalOpen(false);
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            const response = await authFetch(`${BASE_URL}admin/categories/${initialData.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete category");
            }

            addToast("Category deleted successfully", "success");
            // Force reload to update the sidebar/menu
            window.location.href = '/categories';
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const OpenModal = (flag: boolean) => setIsModalOpen(flag);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const url = initialData
                ? `${BASE_URL}admin/categories` // The API seems to use POST for update with ID in body based on CategoriesManager
                : `${BASE_URL}admin/categories`;

            // If updating, include ID
            const payload: any = {
                name: name.trim(),
                slug: slug.trim() || undefined,
                parent_id: parentId,
                position: position,
                active: active,
                meta_title: metaTitle.trim() || undefined,
                meta_description: metaDescription.trim() || undefined,
                og_image: ogImage || undefined,
            };

            if (initialData) {
                payload.id = initialData.id;
            }

            const response = await authFetch(url, {
                method: "POST", // Using POST as per existing implementation
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = errorData.message || "Failed to save category";

                if (errorData.errors) {
                    const validationErrors = Object.values(errorData.errors)
                        .flat()
                        .join('\n');
                    if (validationErrors) {
                        errorMessage = validationErrors;
                    }
                }

                throw new Error(errorMessage);
            }

            addToast(initialData ? "Category updated successfully!" : "Category created successfully!", "success");

            if (onSuccess) {
                onSuccess();
            } else {
                if (submitAction === 'saveAndBack') {
                    // Force reload to update the sidebar/menu and list
                    window.location.href = '/categories';
                } else {
                    // Default behavior for "Add": reset
                    if (!initialData) {
                        setName("");
                        setSlug("");
                        setParentId(0);
                        setPosition(1);
                        setActive(true);
                        setMetaTitle("");
                        setMetaDescription("");
                        setOgImage("");
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
                                placeholder="Enter category name"
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={loading}
                            >
                                <option value={0}>Root Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                                <input
                                    type="number"
                                    value={position}
                                    onChange={(e) => setPosition(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    min="1"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <Switch
                                    label="Active"
                                    checked={active}
                                    onChange={setActive}
                                    disabled={loading}
                                />
                            </div>
                        </div>


                    </div>

                    {/* Right Column: SEO & Image */}
                    <div className="space-y-4">

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
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}

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
