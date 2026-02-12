"use client";

import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

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
        } catch (err: any) {
            addToast(err.message, "error");
        } finally {
            setIsBulkAssigning(false);
        }
    };

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Bulk Assign Topics</h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                Assign a <strong>Target Topic</strong> to all posts that currently have the <strong>Source Topic</strong>. existing tags are preserved.
            </p>
            <form onSubmit={handleBulkAssign} className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Topic</label>
                    <select
                        value={sourceTagId}
                        onChange={(e) => setSourceTagId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Select Source...</option>
                        {tags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Topic</label>
                    <select
                        value={targetTagId}
                        onChange={(e) => setTargetTagId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Select Target...</option>
                        {tags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
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
