"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { X, Loader2, Tag as TagIcon } from "lucide-react";
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
    maxTags = 10,
}: TagInputProps) {
    const { authFetch } = useAuth();
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fetch all tags once (as the previous modal did)
    useEffect(() => {
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
        fetchTags();
    }, [authFetch]);

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
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [inputValue, allTags, selectedTags]);

    const handleAddTag = (tagName: string) => {
        const cleanTag = tagName.trim();
        if (cleanTag && !selectedTags.includes(cleanTag) && selectedTags.length < maxTags) {
            onTagsChange([...selectedTags, cleanTag]);
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(inputValue);
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
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((tag) => (
                                <li key={tag.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag(tag.name)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2"
                                    >
                                        <TagIcon className="w-4 h-4 text-gray-400" />
                                        {tag.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No suggestions found. Press Enter to add "{inputValue}".
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
