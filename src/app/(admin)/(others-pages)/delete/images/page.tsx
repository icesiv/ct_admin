"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";
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
  ImageIcon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface ImageData {
  id: number;
  name: string;
  url: string;
  title: string;
  tags?: string[];
  created_at?: string;
  size?: number;
  dimensions?: {
    width: number | null;
    height: number | null;
  };
}

interface ImageApiResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string | null;
    tag: string | null;
    image_object: {
      original_name?: string;
      file_name?: string;
      file_path?: string;
      file_url?: string;
      file_size?: number;
      mime_type?: string;
      dimensions?: {
        width: number | null;
        height: number | null;
      };
    };
    created_at?: string;
  }>;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

export default function DeleteImagesPage() {
  const { user, loading: authLoading, isAuthenticated, authFetch } = useAuth();

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [totalImages, setTotalImages] = useState<number>(0);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals & previews
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ImageData | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchImages = useCallback(
    async (page: number = 1, append: boolean = false): Promise<void> => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        let url = `${BASE_URL}admin/images/upload-image/gallery?page=${page}&per_page=24`;
        if (searchQuery.trim()) {
          url += `&query=${encodeURIComponent(searchQuery.trim())}`;
        }

        const response = await authFetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch library images");
        }

        const resData: ImageApiResponse = await response.json();
        if (resData.success) {
          const transformed: ImageData[] = (resData.data || []).map((img) => ({
            id: img.id,
            name: img.image_object?.file_name || img.image_object?.original_name || `Image #${img.id}`,
            url: img.image_object?.file_url || "",
            title: img.title || img.image_object?.original_name || "Untitled",
            tags: img.tag ? img.tag.split(",").map((t) => t.trim()).filter(Boolean) : [],
            created_at: img.created_at,
            size: img.image_object?.file_size,
            dimensions: img.image_object?.dimensions,
          }));

          if (append) {
            setImages((prev) => [...prev, ...transformed]);
          } else {
            setImages(transformed);
          }

          setCurrentPage(resData.pagination.current_page);
          setHasMorePages(resData.pagination.has_more_pages);
          setTotalImages(resData.pagination.total);
          setError(null);
        } else {
          throw new Error("Failed to load images");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load images");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authFetch, searchQuery]
  );

  useEffect(() => {
    if (isAuthenticated && user?.is_super_admin) {
      fetchImages(1, false);
      setSelectedIds([]);
    }
  }, [isAuthenticated, user, fetchImages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(1, false);
    setSelectedIds([]);
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchImages(currentPage + 1, true);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === images.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img) => img.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete single image
  const handleDeleteSingle = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    try {
      const response = await authFetch(
        `${BASE_URL}admin/images/${imageToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json().catch(() => null);

      if (response.ok && data?.success !== false) {
        setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
        setTotalImages((prev) => Math.max(0, prev - 1));
        setSelectedIds((prev) => prev.filter((id) => id !== imageToDelete.id));
        setStatusMessage({
          type: "success",
          text: `Image #${imageToDelete.id} "${imageToDelete.title}" was successfully deleted from library.`,
        });
        setImageToDelete(null);
        if (previewImage?.id === imageToDelete.id) {
          setPreviewImage(null);
        }
      } else {
        setStatusMessage({
          type: "error",
          text: data?.message || "Failed to delete image.",
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

  // Bulk delete images
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    let successCount = 0;
    let failedCount = 0;

    for (const id of selectedIds) {
      try {
        const response = await authFetch(`${BASE_URL}admin/images/${id}`, {
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
      setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
      setTotalImages((prev) => Math.max(0, prev - successCount));
      setSelectedIds([]);
      setStatusMessage({
        type: "success",
        text: `Successfully deleted ${successCount} image(s) from library.${
          failedCount > 0 ? ` ${failedCount} image(s) failed.` : ""
        }`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: `Failed to delete selected images.`,
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
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
          the required privileges to delete library images.
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
        <PageBreadcrumb pageTitle="Delete Library Images" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-full text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Super Admin Access Only</span>
        </div>
      </div>

      {/* Status banner */}
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

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images by title or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchImages(1, false);
              }}
              title="Refresh"
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Selection & summary */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              {selectedIds.length > 0 && selectedIds.length === images.length ? (
                <CheckSquare className="w-4 h-4 text-red-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>Select All on Page ({images.length})</span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-semibold px-2.5 py-0.5 rounded-full">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Total in library: <strong>{totalImages}</strong>
            </span>
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
      </div>

      {/* Main Image Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading library images...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{error}</p>
            <button
              onClick={() => fetchImages(1, false)}
              className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No images found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different keyword or search query
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => {
                const isSelected = selectedIds.includes(image.id);
                return (
                  <div
                    key={image.id}
                    className={`group relative bg-white dark:bg-gray-900 rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
                      isSelected
                        ? "border-red-500 ring-2 ring-red-400/50"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Select Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(image.id)}
                      className="absolute top-2 left-2 z-10 p-1 bg-white/90 dark:bg-gray-800/90 rounded-md shadow hover:bg-white text-gray-700 dark:text-gray-200 transition"
                      title={isSelected ? "Deselect" : "Select"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-red-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => setImageToDelete(image)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 hover:scale-105 transition"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Thumbnail Image */}
                    <div
                      className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer"
                      onClick={() => setPreviewImage(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Image Info Card */}
                    <div className="p-2.5">
                      <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={image.title}>
                        {image.title}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 flex justify-between items-center">
                        <span>ID: #{image.id}</span>
                        <span>{formatFileSize(image.size)}</span>
                      </div>
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {image.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1 py-0.2 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {image.tags.length > 2 && (
                            <span className="text-[9px] text-gray-400">
                              +{image.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMorePages && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Load More Images
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 mb-4 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {previewImage.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300">ID:</span>
                  #{previewImage.id}
                </div>
                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300">File Size:</span>
                  {formatFileSize(previewImage.size)}
                </div>
                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300">Dimensions:</span>
                  {previewImage.dimensions?.width && previewImage.dimensions?.height
                    ? `${previewImage.dimensions.width} × ${previewImage.dimensions.height}px`
                    : "—"}
                </div>
                <div>
                  <span className="font-semibold block text-gray-700 dark:text-gray-300">Direct Link:</span>
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageToDelete(previewImage);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Image Modal */}
      {imageToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Delete Library Image
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Super Admin Action
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 border border-gray-200 dark:border-gray-600">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={imageToDelete.url}
                  alt={imageToDelete.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs space-y-1">
                <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {imageToDelete.title}
                </div>
                <div className="text-gray-400">ID: #{imageToDelete.id}</div>
                <div className="text-gray-400">{formatFileSize(imageToDelete.size)}</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete this image from the
              library? This action will remove the file and all generated thumbnails
              from the server.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
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

      {/* Bulk Delete Images Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Bulk Delete Images
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Warning: Irreversible Super Admin Action
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              You are about to delete{" "}
              <strong className="text-red-600 font-bold">
                {selectedIds.length} images
              </strong>{" "}
              from the library and server storage. Are you sure you want to proceed?
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
                    Deleting Images...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {selectedIds.length} Images
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
