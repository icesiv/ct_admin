"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";
import Pagination from "@/components/tables/Pagination";
import {
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  ShieldAlert,
  CheckSquare,
  Square,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface NewsArticle {
  id: number;
  title: string;
  summary?: string;
  post_content: string;
  image: string;
  created_by: string;
  category_slug?: string;
  created_at_ago: string;
  post_status: number;
  is_lead?: boolean;
  is_breaking?: boolean;
  view_count?: number;
}

interface ApiResponse {
  success: boolean;
  posts: NewsArticle[];
  pagination: {
    last_page: number;
    total: number;
  };
}

export default function DeletePostsPage() {
  const { user, loading: authLoading, isAuthenticated, authFetch } = useAuth();

  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchBy, setSearchBy] = useState<"title" | "id">("title");
  const [dateFilter, setDateFilter] = useState<number>(30);

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Confirmation Modal state
  const [postToDelete, setPostToDelete] = useState<NewsArticle | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPosts = useCallback(
    async (page: number = 1): Promise<void> => {
      setLoading(true);
      try {
        let url = `${BASE_URL}admin/posts/allposts?per_page=20&page=${page}&days=${dateFilter}`;
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery.trim())}&search_by=${searchBy}`;
        }

        const response = await authFetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data: ApiResponse = await response.json();
        if (data.success) {
          setPosts(data.posts || []);
          setTotalPages(data.pagination?.last_page || 1);
          setTotalPosts(data.pagination?.total || 0);
          setError(null);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    },
    [authFetch, dateFilter, searchQuery, searchBy]
  );

  useEffect(() => {
    if (isAuthenticated && user?.is_super_admin) {
      fetchPosts(1);
      setCurrentPage(1);
      setSelectedIds([]);
    }
  }, [isAuthenticated, user, fetchPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete single post
  const handleDeleteSingle = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(
        `${BASE_URL}admin/posts/${postToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
        setTotalPosts((prev) => Math.max(0, prev - 1));
        setSelectedIds((prev) => prev.filter((id) => id !== postToDelete.id));
        setStatusMessage({
          type: "success",
          text: `Post #${postToDelete.id} "${postToDelete.title}" was successfully deleted.`,
        });
        setPostToDelete(null);
      } else {
        setStatusMessage({
          type: "error",
          text: data?.message || "Failed to delete post.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete multiple posts
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    let successCount = 0;
    let failedCount = 0;

    for (const id of selectedIds) {
      try {
        const response = await authFetch(`${BASE_URL}admin/posts/${id}`, {
          method: "DELETE",
        });
        const data = await response.json().catch(() => null);
        if (response.ok && data?.success !== false) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    setIsDeleting(false);
    setIsBulkModalOpen(false);

    if (successCount > 0) {
      setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setTotalPosts((prev) => Math.max(0, prev - successCount));
      setSelectedIds([]);
      setStatusMessage({
        type: "success",
        text: `Successfully deleted ${successCount} post(s).${
          failedCount > 0 ? ` ${failedCount} post(s) failed.` : ""
        }`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: `Failed to delete selected posts.`,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user?.is_super_admin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm max-w-xl mx-auto mt-12">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Access Restricted
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page is strictly reserved for Super Administrators. You do not have
          the required privileges to delete posts.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb pageTitle="Delete Posts" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-full text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Super Admin Access Only</span>
        </div>
      </div>

      {/* Alert / Notification banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm transition-all ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
              : "bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-3">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as "title" | "id")}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="title">Search by Title</option>
              <option value="id">Search by Post ID</option>
            </select>
          </div>

          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchBy === "id"
                  ? "Enter post ID (e.g. 1024)..."
                  : "Search post title..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="sm:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last 1 Year</option>
              <option value={3650}>All Time</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchPosts(1);
              }}
              title="Refresh"
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Bulk Action Bar */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              {selectedIds.length > 0 && selectedIds.length === posts.length ? (
                <CheckSquare className="w-4 h-4 text-red-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>Select All on Page ({posts.length})</span>
            </button>
            {selectedIds.length > 0 && (
              <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-semibold px-2.5 py-0.5 rounded-full">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading posts for deletion...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{error}</p>
            <button
              onClick={() => fetchPosts(currentPage)}
              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Trash2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No posts found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search criteria or date range
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-12 px-4 py-3.5 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase min-w-[280px]">
                    Post Title
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase hidden sm:table-cell">
                    Author / Date
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {posts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  return (
                    <tr
                      key={post.id}
                      className={`hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors ${
                        isSelected ? "bg-red-50/70 dark:bg-red-950/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelect(post.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            post.post_status === 1
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          #{post.id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
                          {post.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {post.view_count || 0} views
                          </span>
                          {post.is_lead && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded text-[10px] font-bold">
                              LEAD
                            </span>
                          )}
                          {post.is_breaking && (
                            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 rounded text-[10px] font-bold">
                              BREAKING
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {post.category_slug || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {post.created_by || "Admin"}
                        </div>
                        <div>{post.created_at_ago}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/posts/edit/${post.id}`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title="Inspect / Edit Post"
                            target="_blank"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            title="Delete this post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && posts.length > 0 && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {currentPage} of {totalPages} ({totalPosts} total
              posts)
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchPosts(page);
                setSelectedIds([]);
              }}
            />
          </div>
        )}
      </div>

      {/* Single Post Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Delete Post Confirmation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Super Admin Action
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 mb-4 text-sm space-y-1.5">
              <div className="text-xs text-gray-500 font-mono">
                Post ID: #{postToDelete.id}
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">
                {postToDelete.title}
              </div>
              <div className="text-xs text-gray-500">
                Author: {postToDelete.created_by || "Admin"} • Views:{" "}
                {postToDelete.view_count || 0}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete this post? This action
              will immediately unpublish and remove the post from the system.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSingle}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Bulk Delete Confirmation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Warning: Irreversible Super Admin Action
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              You are about to delete{" "}
              <strong className="text-red-600 font-bold">
                {selectedIds.length} posts
              </strong>
              . Are you sure you want to proceed with deleting all selected
              posts?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBulk}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting Posts...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {selectedIds.length} Posts
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
