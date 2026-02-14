"use client";

import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { Search, X } from "lucide-react";

interface Tag {
    id: number;
    name: string;
}

export default function TagBulkAssign() {
    const { authFetch } = useAuth();
    const { addToast } = useToast();

    const [tags, setTags] = useState<Tag[]>([]);
    const [sourceTagId, setSourceTagId] = useState<string>("");
    const [targetTagId, setTargetTagId] = useState<string>("");
    const [isBulkAssigning, setIsBulkAssigning] = useState<boolean>(false);

    // Search state for Target Topic
    const [targetSearchTerm, setTargetSearchTerm] = useState("");
    const [showTargetDropdown, setShowTargetDropdown] = useState(false);

    // Search state for Source Topic
    const [sourceSearchTerm, setSourceSearchTerm] = useState("");
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await authFetch(`${BASE_URL}tags`);
                if (response.ok) {
                    const data = await response.json();
                    setTags(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch tags", error);
            }
        };
        fetchTags();
    }, [authFetch]);

    const handleBulkAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceTagId || !targetTagId || sourceTagId === targetTagId) return;

        if (!window.confirm("Are you sure you want to assign the target topic to all posts with the source topic?")) return;

        try {
            setIsBulkAssigning(true);
            const response = await authFetch(`${BASE_URL}tags/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source_tag_id: sourceTagId,
                    target_tag_id: targetTagId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to bulk assign tags");
            }

            const result = await response.json();
            addToast(result.message, "success");

            setSourceTagId("");
            setTargetTagId("");
            setTargetSearchTerm("");
            setSourceSearchTerm("");
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setIsBulkAssigning(false);
        }
    };

    // Filter tags for target search
    const filteredTargetTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(targetSearchTerm.toLowerCase()) &&
        tag.id.toString() !== sourceTagId // Exclude source tag from target options
    );

    // Filter tags for source search
    const filteredSourceTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(sourceSearchTerm.toLowerCase()) &&
        tag.id.toString() !== targetTagId // Exclude target tag from source options
    );

    const selectedTargetTagName = tags.find(t => t.id.toString() === targetTagId)?.name;
    const selectedSourceTagName = tags.find(t => t.id.toString() === sourceTagId)?.name;

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-6 shadow-sm">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                যেসব পোস্টে বর্তমানে <strong>সোর্স টপিক (Source Topic)</strong> আছে, সেগুলোতে <strong>টার্গেট টপিক (Target Topic)</strong> অ্যাসাইন/নির্ধারণ করুন। বিদ্যমান অন্য ট্যাগগুলো অপরিবর্তিত থাকবে।
            </p>
            <form onSubmit={handleBulkAssign} className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Topic</label>

                    {sourceTagId ? (
                        <div className="flex items-center justify-between w-full px-4 py-2 border border-blue-200 bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300">
                            <span className="truncate">{selectedSourceTagName}</span>
                            <button
                                type="button"
                                onClick={() => setSourceTagId("")}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={sourceSearchTerm}
                                onChange={(e) => {
                                    setSourceSearchTerm(e.target.value);
                                    setShowSourceDropdown(true);
                                }}
                                onFocus={() => setShowSourceDropdown(true)}
                                onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                                placeholder="Search source topic..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />

                            {showSourceDropdown && sourceSearchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredSourceTags.length > 0 ? (
                                        filteredSourceTags.map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    setSourceTagId(tag.id.toString());
                                                    setSourceSearchTerm("");
                                                    setShowSourceDropdown(false);
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

                <div className="flex-1 w-full relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Topic</label>

                    {targetTagId ? (
                        <div className="flex items-center justify-between w-full px-4 py-2 border border-blue-200 bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300">
                            <span className="truncate">{selectedTargetTagName}</span>
                            <button
                                type="button"
                                onClick={() => setTargetTagId("")}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={targetSearchTerm}
                                onChange={(e) => {
                                    setTargetSearchTerm(e.target.value);
                                    setShowTargetDropdown(true);
                                }}
                                onFocus={() => setShowTargetDropdown(true)}
                                onBlur={() => setTimeout(() => setShowTargetDropdown(false), 200)} // Delay to allow click
                                placeholder="Search target topic..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />

                            {showTargetDropdown && targetSearchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredTargetTags.length > 0 ? (
                                        filteredTargetTags.map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    setTargetTagId(tag.id.toString());
                                                    setTargetSearchTerm("");
                                                    setShowTargetDropdown(false);
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
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 h-[42px]"
                    disabled={isBulkAssigning || !sourceTagId || !targetTagId || sourceTagId === targetTagId}
                >
                    {isBulkAssigning ? "Assigning..." : "Assign"}
                </button>
            </form>
        </div>
    );
}
