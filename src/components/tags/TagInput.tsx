"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from "react";
import { X, Loader2, Tag as TagIcon, Plus } from "lucide-react";
import TagForm from "./TagForm";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface TagInputProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    maxTags?: number;
}

export default function TagInput({
    selectedTags,
    onTagsChange,
    maxTags = 20,
}: TagInputProps) {
    const { authFetch } = useAuth();
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Scroll active item into view
    useEffect(() => {
        if (showSuggestions && focusedIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[focusedIndex] as HTMLElement;
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [focusedIndex, showSuggestions]);

    const fetchTags = useCallback(async () => {
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
    }, [authFetch]);

    // Fetch all tags once (as the previous modal did)
    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filter suggestions when input changes
    useEffect(() => {
        if (inputValue.length >= 3) {
            const filtered = allTags.filter((t) =>
                t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
                !selectedTags.includes(t.name)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
            setFocusedIndex(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setFocusedIndex(-1);
        }
    }, [inputValue, allTags, selectedTags]);

    const handleAddTag = (tagName: string) => {
        const cleanTag = tagName.trim();
        const tagExists = allTags.some(t => t.name.toLowerCase() === cleanTag.toLowerCase());

        if (cleanTag && tagExists && !selectedTags.includes(cleanTag) && selectedTags.length < maxTags) {
            const actualTag = allTags.find(t => t.name.toLowerCase() === cleanTag.toLowerCase())?.name || cleanTag;
            onTagsChange([...selectedTags, actualTag]);
            setInputValue("");
            setShowSuggestions(false);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            }
        } else if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (showSuggestions && focusedIndex >= 0 && focusedIndex < suggestions.length) {
                handleAddTag(suggestions[focusedIndex].name);
            } else {
                handleAddTag(inputValue);
            }
        } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
            handleRemoveTag(selectedTags[selectedTags.length - 1]);
        }
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                    {selectedTags.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                            ({selectedTags.length}/{maxTags})
                        </span>
                    )}
                </label>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Tag
                </button>
            </div>

            <div className="min-h-[42px] p-1.5 flex flex-wrap gap-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-400 bg-white dark:bg-gray-800 transition-colors">
                {selectedTags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium border border-blue-200 dark:border-blue-700"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
                
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={selectedTags.length >= maxTags}
                    className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 p-1 disabled:opacity-50"
                    placeholder={selectedTags.length >= maxTags ? "Maximum tags reached" : "Type to add tags..."}
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && inputValue.length >= 3 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl max-h-64 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-2" ref={listRef}>
                            {suggestions.map((tag, index) => (
                                <li key={tag.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag(tag.name)}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                            index === focusedIndex
                                                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-medium'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300'
                                        }`}
                                    >
                                        <TagIcon className={`w-4 h-4 ${index === focusedIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                        {tag.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-1">
                            <p>No suggestions found for "{inputValue}".</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Click <strong className="text-blue-600 dark:text-blue-400">New Tag</strong> to create it.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Tag Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative">
                        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Tag</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <TagForm 
                                onSuccess={() => {
                                    setIsCreateModalOpen(false);
                                    fetchTags();
                                    // Optionally select the newly created tag by default (but we don't have its name directly here)
                                }}
                                onCancel={() => setIsCreateModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
