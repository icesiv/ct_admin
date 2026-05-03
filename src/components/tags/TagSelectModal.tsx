"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Search, Plus, Loader2, Tag as TagIcon, Check } from "lucide-react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import TagForm from "./TagForm";

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface TagSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTags: string[]; // tag names currently on the post
    onConfirm: (tags: string[]) => void;
}

export default function TagSelectModal({
    isOpen,
    onClose,
    selectedTags,
    onConfirm,
}: TagSelectModalProps) {
    const { authFetch } = useAuth();

    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [localSelected, setLocalSelected] = useState<string[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Sync local selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalSelected([...selectedTags]);
            setSearchTerm("");
            setShowCreateForm(false);
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const response = await authFetch(`${BASE_URL}tags`);
            if (response.ok) {
                const result = await response.json();
                setAllTags(result.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch tags:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTagCreated = () => {
        // Refresh the tag list and go back to select view
        fetchTags();
        setShowCreateForm(false);
    };

    const filteredTags = allTags.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleTag = (tagName: string) => {
        setLocalSelected((prev) =>
            prev.includes(tagName)
                ? prev.filter((t) => t !== tagName)
                : prev.length < 10
                ? [...prev, tagName]
                : prev
        );
    };

    const handleConfirm = () => {
        onConfirm(localSelected);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {showCreateForm ? "Create New Tag" : "Select Tags"}
                        </h2>
                        {!showCreateForm && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                {localSelected.length}/10
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {showCreateForm ? (
                        /* ── Create Tag View ── */
                        <div className="p-6">
                            <TagForm onSuccess={handleTagCreated} />
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                ← Back to tag list
                            </button>
                        </div>
                    ) : (
                        /* ── Select Tags View ── */
                        <div className="p-6 space-y-4">
                            {/* Search + Create button */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search tags…"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Tag
                                </button>
                            </div>

                            {/* Selected Tags preview */}
                            {localSelected.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {localSelected.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className="hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                                                aria-label={`Remove ${tag}`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tag list */}
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : filteredTags.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <TagIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No tags found.</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(true)}
                                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Create a new tag
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {filteredTags.map((tag) => {
                                        const isSelected = localSelected.includes(tag.name);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag.name)}
                                                disabled={!isSelected && localSelected.length >= 10}
                                                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${
                                                    isSelected
                                                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                                }`}
                                            >
                                                <span className="truncate">#{tag.name}</span>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showCreateForm && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {localSelected.length === 0
                                ? "No tags selected"
                                : `${localSelected.length} tag${localSelected.length !== 1 ? "s" : ""} selected`}
                        </span>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
