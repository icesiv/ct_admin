"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';

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

interface FormData {
    name: string;
    slug: string;
    parent_id: number;
    position: number;
    active: boolean;
}

interface CategoryPayload {
    id?: number;
    name: string;
    slug: string;
    position: number;
    parent_id: number;
}

interface TogglePayload {
    id: number;
    active: boolean;
}

const CategoryCRUD: React.FC = () => {
    // Remove the type assertion and let TypeScript infer the type
    const authContext = useAuth();
    const { news_categories, fetchCategories, router } = authContext;

    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        slug: '',
        parent_id: 0,
        position: 1,
        active: true
    });

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

    // Get root categories (parent_id = 0) for dropdown
    const getRootCategories = (): Category[] => {
        return categories.filter(cat => cat.parent_id === 0);
    };

    // Get all categories organized by parent
    const getCategorizedList = (): CategoryWithChildren[] => {
        const rootCategories = categories.filter(cat => cat.parent_id === 0);
        const childCategories = categories.filter(cat => cat.parent_id !== 0);

        return rootCategories.map(root => ({
            ...root,
            children: childCategories.filter(child => child.parent_id === root.id)
        }));
    };

    // Generate slug from name
    const generateSlug = (name: string): string => {
        return name.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'parent_id' || name === 'position' ? Number(value) : value)
        }));

        // Auto-generate slug when name changes
        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(value)
            }));
        }
    };

    // Reset form
    const resetForm = (): void => {
        setFormData({
            name: '',
            slug: '',
            parent_id: 0,
            position: 1,
            active: true
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    // Handle create/update
    const handleSubmit = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');

        // Basic validation
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        const cat: CategoryPayload = {
            ...(editingCategory && { id: editingCategory.id }),
            name: formData.name,
            slug: formData.slug || generateSlug(formData.name),
            position: formData.position,
            parent_id: formData.parent_id
        };

        try {
            await fetch(`${BASE_URL}admin/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cat)
            });
            await fetchCategories();
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error saving category');
        }
    };

    // Handle edit
    const handleEdit = (category: Category): void => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id,
            position: category.position,
            active: category.active
        });
        setShowForm(true);
    };

    // Handle delete
    const handleDelete = (id: number): void => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(cat => cat.id !== id));
        }
    };

    // Toggle active status
    const toggleActive = async (root_cat: Category): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        const cates: TogglePayload = {
            id: root_cat.id,
            active: !root_cat.active
        };

        try {
            await fetch(`${BASE_URL}admin/categories/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cates)
            });
            setCategories(prev => prev.map(cat =>
                cat.id === root_cat.id
                    ? { ...cat, active: !cat.active, updated_at: new Date().toISOString() }
                    : cat
            ));
        } catch (error) {
            console.error('Error toggling category status:', error);
            alert('Error updating category status');
        }
    };

    const handleBack = (): void => {
        router.push('/dashboard');
    };

    const categorizedList = getCategorizedList();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Category Management</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Parent Category
                                    </label>
                                    <select
                                        name="parent_id"
                                        value={formData.parent_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value={0}>Root Category</option>
                                        {getRootCategories().map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Position
                                    </label>
                                    <input
                                        type="number"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                                            if (e) e.preventDefault();
                                            await handleSubmit();
                                        }}
                                        className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Save size={16} />
                                        {editingCategory ? 'Update' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="p-6">
                    <div className="space-y-4">
                        {categorizedList.map((rootCategory: CategoryWithChildren) => (
                            <div key={rootCategory.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                {/* Root Category */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{rootCategory.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">/{rootCategory.slug}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rootCategory.active
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                            }`}>
                                            {rootCategory.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                            Position: {rootCategory.position}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={async () => {
                                                await toggleActive(rootCategory);
                                            }}
                                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${rootCategory.active
                                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                                                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                                                }`}
                                        >
                                            {rootCategory.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(rootCategory)}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rootCategory.id)}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Child Categories */}
                                {rootCategory.children.length > 0 && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rootCategory.children.map((childCategory: Category) => (
                                            <div key={childCategory.id} className="p-4 pl-8 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600"></div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 dark:text-gray-300">{childCategory.name}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">/{childCategory.slug}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${childCategory.active
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                                        }`}>
                                                        {childCategory.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                        Position: {childCategory.position}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            await toggleActive(childCategory);
                                                        }}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${childCategory.active
                                                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                                                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                                                            }`}
                                                    >
                                                        {childCategory.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(childCategory)}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(childCategory.id)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCRUD;