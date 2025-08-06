// components/admin/TagManager.tsx (or your preferred path)
"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { BASE_URL } from '@/config/config';
import { toast } from "sonner"; // Assuming you're using sonner for notifications

// Define the Tag interface based on your Laravel model
interface Tag {
  id: number;
  name: string;
  slug: string;
  // created_at?: string; // Add if needed
  // updated_at?: string; // Add if needed
}

export default function TagManager() {
  // State for tags, loading, and form
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
                 
      const response = await fetch(`${BASE_URL}tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`, // Adjust based on your auth method
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTags(data.data || []); // Assuming API returns { data: [...] }
    } catch (err: any) {
      console.error("Error fetching tags:", err);
      setError(err.message || "Failed to load tags");
      toast.error("Error", {
        description: err.message || "Failed to load tags",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setIsAdding(true);
      const response = await fetch(`${BASE_URL}tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add tag: ${response.status}`);
      }

      const result = await response.json();
      setTags([result.data, ...tags]); // Add to the top of the list
      setNewTagName("");
      toast.success("Success", {
        description: "Tag added successfully!",
      });
    } catch (err: any) {
      console.error("Error adding tag:", err);
      toast.error("Error", {
        description: err.message || "Failed to add tag",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a tag
  const handleDeleteTag = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the tag "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}tags/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete tag: ${response.status}`);
      }

      setTags(tags.filter(tag => tag.id !== id));
      toast.success("Success", {
        description: "Tag deleted successfully!",
      });
    } catch (err: any) {
      console.error("Error deleting tag:", err);
      toast.error("Error", {
        description: err.message || "Failed to delete tag",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }
  };

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="space-y-6">
      {/* Add Tag Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Tag</h2>
        <form onSubmit={handleAddTag} className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isAdding}
            required
            minLength={1}
            maxLength={255}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={isAdding || !newTagName.trim()}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Tag
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tags Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
        <div className="max-w-4xl mx-auto overflow-x-auto">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 text-sm border-b border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No tags found. Add your first tag above.
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                  >
                    Tag Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                  >
                    Slug
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="px-4 py-4 sm:px-6 text-center font-medium text-gray-800 dark:text-gray-200">
                      {tag.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-sm dark:text-gray-400">
                      {tag.slug}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-4">
                        {/* Edit button - implement edit functionality as needed */}
                        {/* <button 
                          className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                          title="Edit"
                          disabled // Disabled until edit functionality is implemented
                        >
                          <Edit3 size={18} />
                        </button> */}
                        <button
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}