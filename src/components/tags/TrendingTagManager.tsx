"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2, Save, GripVertical, Plus, Search, Edit3, X } from "lucide-react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

interface TrendingTag {
    id: number;
    tag_id: number;
    title: string;
    position: number;
    created_at_ago: string;
}

interface Tag {
    id: number;
    name: string;
}

export default function TrendingTagManager() {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [adding, setAdding] = useState<boolean>(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    // Drag & Drop State
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTrendingTags();
        fetchAllTags();
    }, []);

    const fetchTrendingTags = async () => {
        try {
            setLoading(true);
            const response = await authFetch(`${BASE_URL}admin/trending-tags`);
            if (response.ok) {
                const data = await response.json();
                setTrendingTags(data.data || []);
                setHasChanges(false);
            }
        } catch (error) {
            console.error("Failed to fetch trending tags", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTags = async () => {
        try {
            const response = await authFetch(`${BASE_URL}tags`);
            if (response.ok) {
                const data = await response.json();
                setAllTags(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch tags", error);
        }
    };

    const handleAddTag = async () => {
        if (!selectedTagId) return;

        setAdding(true);
        try {
            const response = await authFetch(`${BASE_URL}admin/trending-tags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tag_id: selectedTagId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add tag");
            }

            await fetchTrendingTags();
            setSelectedTagId("");
            setSearchTerm("");
            addToast("Tag added to trending list", "success");
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveTag = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this tag from trending?")) return;

        try {
            const response = await authFetch(`${BASE_URL}admin/trending-tags/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove tag");
            }

            setTrendingTags(trendingTags.filter((t) => t.id !== id));
            addToast("Tag removed from trending list", "success");
        } catch (err: any) {
            addToast(err.message, "error");
        }
    };

    const handleEditTag = (tagId: number) => {
        router.push(`/topics/${tagId}/edit`);
    };

    const saveOrder = async () => {
        setSaving(true);
        try {
            const orderData = trendingTags.map((tag, index) => ({
                id: tag.id,
                position: index + 1,
            }));

            const response = await authFetch(`${BASE_URL}admin/trending-tags/reorder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: orderData }),
            });

            if (!response.ok) throw new Error("Failed to save order");

            setHasChanges(false);
            addToast("Order saved successfully", "success");
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // Drag & Drop Handlers (Adapted from SortableNewsList)
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedItem === null || draggedItem === dropIndex) {
            setDraggedItem(null);
            setDragOverIndex(null);
            return;
        }

        const newTags = [...trendingTags];
        const draggedTag = newTags[draggedItem];

        newTags.splice(draggedItem, 1);
        const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
        newTags.splice(insertIndex, 0, draggedTag);

        setTrendingTags(newTags);
        setHasChanges(true);
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    // Filter tags for search
    const filteredTags = allTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !trendingTags.some(tt => tt.tag_id === tag.id)
    );

    const selectedTagName = allTags.find(t => t.id.toString() === selectedTagId)?.name;

    return (
        <div className="space-y-8">
            {/* Add New Trending Tag */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Trending Topic</h2>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Topic</label>

                        {selectedTagId ? (
                            <div className="flex items-center justify-between w-full px-4 py-2 border border-blue-200 bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300">
                                <span className="truncate">{selectedTagName}</span>
                                <button
                                    onClick={() => setSelectedTagId("")}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search topics to add..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />

                                {showDropdown && searchTerm && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredTags.length > 0 ? (
                                            filteredTags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => {
                                                        setSelectedTagId(tag.id.toString());
                                                        setSearchTerm("");
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                                >
                                                    {tag.name}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                No topics found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddTag}
                        disabled={!selectedTagId || adding}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 h-[42px]"
                    >
                        {adding ? "Adding..." : <><Plus size={18} /> Add</>}
                    </button>
                </div>
            </div>

            {/* Trending List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Trending Order <span className="ml-2 text-xs text-normal text-gray-600 dark:text-gray-400">
                        Drag and drop topics to reorder them on the trending section.
                    </span></h2>
                    {hasChanges && (
                        <button
                            onClick={saveOrder}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : <><Save size={18} /> Save Order</>}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : trendingTags.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No trending topics yet. Add one above.</div>
                ) : (
                    <div className="space-y-3" ref={containerRef}>
                        {trendingTags.map((tag, index) => (
                            <div
                                key={tag.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`
                  flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-700 transition-all cursor-move
                  ${draggedItem === index ? 'opacity-50 border-blue-500 border-dashed' : 'border-gray-200 dark:border-gray-600'}
                  ${dragOverIndex === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
                            >
                                <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                </div>

                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-200">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800 dark:text-white">{tag.title}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Added {tag.created_at_ago}</span>
                                </div>

                                <button
                                    onClick={() => handleEditTag(tag.tag_id)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit Topic"
                                >
                                    <Edit3 size={18} />
                                </button>

                                <button
                                    onClick={() => handleRemoveTag(tag.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Remove from trending"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
