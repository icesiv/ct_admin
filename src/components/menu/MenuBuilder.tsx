'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Type definitions
interface MenuItem {
    id: number;
    label: string;
    slug: string;
    isExpanded?: boolean;
    children?: MenuItem[];
}

interface NewItemForm {
    label: string;
    slug: string;
    parentId: number | null;
}

interface CleanMenuItem {
    label: string;
    slug: string;
    children?: CleanMenuItem[];
}

const MenuBuilder: React.FC = () => {
    const { news_categories, user, loading, isAuthenticated, handleLogout, router, saveMenu, fetchMenu } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [newItemForm, setNewItemForm] = useState<NewItemForm>({ label: '', slug: '', parentId: null });
    const [showAddForm, setShowAddForm] = useState<boolean>(false);

    const generateId = (): number => Math.floor(Math.random() * 10000);

    const findItemById = (items: MenuItem[], id: number): MenuItem | null => {
        for (let item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findItemById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const updateItemInTree = (items: MenuItem[], id: number, updates: Partial<MenuItem>): MenuItem[] => {
        return items.map(item => {
            if (item.id === id) {
                return { ...item, ...updates };
            }
            if (item.children) {
                return { ...item, children: updateItemInTree(item.children, id, updates) };
            }
            return item;
        });
    };

    const deleteItemFromTree = (items: MenuItem[], id: number): MenuItem[] => {
        return items.filter(item => {
            if (item.id === id) return false;
            if (item.children) {
                item.children = deleteItemFromTree(item.children, id);
            }
            return true;
        });
    };

    const addItemToTree = (items: MenuItem[], parentId: number | null, newItem: MenuItem): MenuItem[] => {
        if (!parentId) {
            return [...items, newItem];
        }

        return items.map(item => {
            if (item.id === parentId) {
                return {
                    ...item,
                    children: [...(item.children || []), newItem]
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: addItemToTree(item.children, parentId, newItem)
                };
            }
            return item;
        });
    };

    const toggleExpanded = (id: number): void => {
        setMenuItems(updateItemInTree(menuItems, id, {
            isExpanded: !findItemById(menuItems, id)?.isExpanded
        }));
    };

    const startEditing = (item: MenuItem): void => {
        setEditingItem({ ...item });
    };

    const saveEdit = (): void => {
      console.log(editingItem);
        if (!editingItem) return;
        
        setMenuItems(updateItemInTree(menuItems, editingItem.id, {
            label: editingItem.label,
            slug: editingItem.slug
        }));
        setEditingItem(null);
    };

    const cancelEdit = (): void => {
        setEditingItem(null);
    };

    const deleteItem = (id: number): void => {
        setMenuItems(deleteItemFromTree(menuItems, id));
    };

    const addNewItem = (): void => {
        if (!newItemForm.label.trim()) return;

        const newItem: MenuItem = {
            id: generateId(),
            label: newItemForm.label,
            slug: newItemForm.slug,
            isExpanded: false,
            children: []
        };

        setMenuItems(addItemToTree(menuItems, newItemForm.parentId, newItem));
        setNewItemForm({ label: '', slug: '', parentId: null });
        setShowAddForm(false);
    };

    // Function to export menu data without internal properties
    const exportMenuData = (): CleanMenuItem[] => {
        const cleanMenuItem = (item: MenuItem): CleanMenuItem => {
            const cleaned: CleanMenuItem = {
                label: item.label,
                slug: item.slug
            };

            if (item.children && item.children.length > 0) {
                cleaned.children = item.children.map(cleanMenuItem);
            }

            return cleaned;
        };

        return menuItems.map(cleanMenuItem);
    };

    const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element => {
        const hasChildren = item.children && item.children.length > 0;
        const isEditing = editingItem && editingItem.id === item.id;

        return (
            <div key={item.id} className="w-full">
                <div
                    className={`flex items-center gap-2 p-3 border border-gray-200 rounded-lg mb-2 bg-white hover:bg-gray-50 transition-colors ${level > 0 ? 'ml-6' : ''}`}
                    style={{ marginLeft: level * 24 }}
                >
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpanded(item.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            {item.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}

                    {!hasChildren && <div className="w-6" />}

                    {isEditing && editingItem ? (
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={editingItem.label}
                                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Label"
                            />
                            <input
                                type="text"
                                value={editingItem.slug}
                                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Slug"
                            />
                            <button
                                onClick={saveEdit}
                                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                <Save size={14} />
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.label}</div>
                                <div className="text-sm text-gray-500">
                                    {item.slug ? `/${item.slug}` : '<empty slug>'}
                                </div>
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setNewItemForm({ ...newItemForm, parentId: item.id });
                                        setShowAddForm(true);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    title="Add submenu"
                                >
                                    <Plus size={14} />
                                </button>
                                <button
                                    onClick={() => startEditing(item)}
                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {hasChildren && item.isExpanded && (
                    <div className="ml-4">
                        {item.children!.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await fetchMenu();
                setMenuItems(response.data);
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        })();
    }, [fetchMenu]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">         
                {/* Menu Builder Panel */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">Menu Structure</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        await saveMenu({
                                            name: 'main_navigation',
                                            menu: JSON.stringify(menuItems)
                                        });
                                    } catch (error) {
                                        console.error('Error saving menu:', error);
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                                Save
                            </button>
                           
                            <button
                                onClick={() => {
                                    setNewItemForm({ label: '', slug: '', parentId: null });
                                    setShowAddForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                Add Main Menu
                            </button>
                        </div>
                    </div>

                    {/* Add Item Form */}
                    {showAddForm && (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                            <h3 className="font-medium text-gray-800 mb-3">
                                {newItemForm.parentId ? 'Add Submenu Item' : 'Add Main Menu Item'}
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Menu Label (e.g., ক্যাম্পাসের খবর)"
                                    value={newItemForm.label}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, label: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Slug (e.g., campus-news)"
                                    value={newItemForm.slug}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={addNewItem}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Add Item
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewItemForm({ label: '', slug: '', parentId: null });
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="space-y-2">
                        {menuItems.map(item => renderMenuItem(item))}
                    </div>

                    {menuItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No menu items yet. Add your first menu item or load sample data to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuBuilder;