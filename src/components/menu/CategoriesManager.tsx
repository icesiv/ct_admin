"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';
import Link from 'next/link';

// Type definitions
interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number;
    position: number;
    active: boolean;
    updated_at?: string;
    created_at?: string;
}

interface CategoryWithChildren extends Category {
    children: Category[];
}

interface TogglePayload {
    id: number;
    active: boolean;
}

const CategoryCRUD: React.FC = () => {
    const authContext = useAuth();
    const { news_categories, fetchCategories, authFetch } = authContext;

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (news_categories && news_categories.length > 0) {
            // Transform the categories to match our local Category type
            const transformedCategories: Category[] = news_categories.map(cat => ({
                id: typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id,
                name: cat.name,
                slug: (cat as any).slug || '',
                parent_id: typeof (cat as any).parent_id === 'string' ? parseInt((cat as any).parent_id, 10) : ((cat as any).parent_id || 0),
                position: typeof (cat as any).position === 'string' ? parseInt((cat as any).position, 10) : ((cat as any).position || 1),
                active: (cat as any).active !== false,
                updated_at: (cat as any).updated_at,
                created_at: (cat as any).created_at
            }));
            setCategories(transformedCategories);
        }
    }, [news_categories]);

    // Get all categories organized by parent
    const getCategorizedList = (): CategoryWithChildren[] => {
        const rootCategories = categories.filter(cat => cat.parent_id === 0);
        const childCategories = categories.filter(cat => cat.parent_id !== 0);

        return rootCategories.map(root => ({
            ...root,
            children: childCategories.filter(child => child.parent_id === root.id)
        }));
    };

    // Toggle active status
    const toggleActive = async (root_cat: Category): Promise<void> => {
        const cates: TogglePayload = {
            id: root_cat.id,
            active: !root_cat.active
        };

        try {
            await authFetch(`${BASE_URL}admin/categories/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cates)
            });
            // Update local state optimsitically or re-fetch
            fetchCategories();
        } catch (error) {
            console.error('Error toggling category status:', error);
            alert('Error updating category status');
        }
    };

    const categorizedList = getCategorizedList();

    const reload = () => fetchCategories();

    const CategoryHeader: React.FC<{
        onReload: () => void;
    }> = ({ onReload }) => (
        <div className="flex border-y py-2 border-gray-200 dark:border-gray-700 justify-end items-center flex-wrap gap-2">
            <div className="flex gap-2">
                <button
                    onClick={onReload}
                    className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-800 flex items-center gap-2 transition-colors"
                >
                    <RefreshCcw size={20} />
                </button>

                <Link
                    href="/categories/new"
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </Link>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 max-w-3xl mx-auto">

            {/* Header */}
            <CategoryHeader
                onReload={reload}
            />

            {/* Categories List */}
            <div className="p-2 md:p-6 space-y-4 max-w-3xl mx-auto">
                {categorizedList.map((rootCategory: CategoryWithChildren) => (
                    <div key={rootCategory.id}>
                        {/* Root Category */}
                        <div className=" flex  justify-between p-4 gap-y-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">{rootCategory.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 mr-2 rounded">
                                        {rootCategory.id}
                                    </span>
                                    {rootCategory.slug}</p>
                            </div>

                            <div className="flex justify-end items-center gap-2">
                                <span className={`px-2 py-1 mr-4 rounded-full text-xs font-medium ${rootCategory.active
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                    }`}>
                                    {rootCategory.active ? 'Active' : 'Inactive'}
                                </span>

                                <Link
                                    href={`/categories/${rootCategory.id}/edit`}
                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                >
                                    <Edit2 size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* Child Categories */}
                        {rootCategory.children.length > 0 && (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {rootCategory.children.map((childCategory: Category) => (
                                    <div key={childCategory.id} className="p-4 pl-4 md:pl-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600"></div>
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-700 dark:text-gray-300">{childCategory.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 mr-2 rounded">
                                                        {childCategory.id}
                                                    </span>
                                                    {childCategory.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center gap-2">
                                            <span className={`px-2 py-1 mr-4 rounded-full text-xs font-medium ${childCategory.active
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                                }`}>
                                                {childCategory.active ? 'Active' : 'Inactive'}
                                            </span>

                                            <Link
                                                href={`/categories/${childCategory.id}/edit`}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <CategoryHeader
                onReload={reload}
            />
        </div>
    );
};

export default CategoryCRUD;