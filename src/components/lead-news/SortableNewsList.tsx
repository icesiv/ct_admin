"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Save, Check } from 'lucide-react';
import { BASE_URL } from '@/config/config';
import { useAuth } from '@/context/AuthContext';

// Type definitions
interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  summary?: string;
  image: string;
  category: Category;
  created_at_ago: string;
}

interface SortOrder {
  position: number;
  id: string;
  title: string;
}

interface OrderData {
  id: string;
  position: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface SortableNewsListProps {
  leadPosts: Article[];
  fetchLeadNews: () => Promise<void>;
  mode: string;
}

const SortableNewsList: React.FC<SortableNewsListProps> = ({ leadPosts, fetchLeadNews, mode }) => {
  const { authFetch } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Ref for the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setArticles(leadPosts);
    setHasChanges(false); // Reset changes when new data is loaded
  }, [leadPosts]);

  const deleteLeadNews = async (news_id: string): Promise<void> => {
    const url = `${BASE_URL}admin/posts/${mode}/remove`;
    const auth_token = localStorage.getItem('auth_token');

    try {
      const response = await authFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news_id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  };

  const saveOrder = async (): Promise<void> => {
    const auth_token = localStorage.getItem('auth_token');
    const url = `${BASE_URL}admin/posts/${mode}/reorder`;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const orderData: OrderData[] = articles.map((article, index) => ({
        id: article.id,
        position: index + 1
      }));

      const response = await authFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: orderData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error saving order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault();
    setDragOverIndex(index);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const y = e.clientY;
    const scrollSpeed = 15;
    const inertia = 1.5;

    // Auto-scroll logic
    if (y < rect.top + 80) {
      // Near top → scroll up
      const speed = (rect.top + 80 - y) / inertia;
      container.scrollTop -= Math.max(speed, 1);
    } else if (y > rect.bottom - 80) {
      // Near bottom → scroll down
      const speed = (y - (rect.bottom - 80)) / inertia;
      container.scrollTop += Math.max(speed, 1);
    }
  };

  const handleDragLeave = (): void => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newArticles = [...articles];
    const draggedArticle = newArticles[draggedItem];

    // Remove the dragged item
    newArticles.splice(draggedItem, 1);

    // Insert at new position
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newArticles.splice(insertIndex, 0, draggedArticle);

    setArticles(newArticles);
    setHasChanges(true);

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (): void => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDeleteClick = async (articleId: string): Promise<void> => {
    setDeleteConfirm(articleId);
  };

  const handleDeleteConfirm = async (articleId: string): Promise<void> => {
    try {
      await deleteLeadNews(articleId);
      await fetchLeadNews();

      const newArticles = articles.filter(article => article.id !== articleId);
      setArticles(newArticles);
      setHasChanges(true); // Reordering changes after delete

      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>ক্রম সফলভাবে সংরক্ষণ হয়েছে</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          {/* Save Button */}
          <button
            onClick={saveOrder}
            disabled={!hasChanges || isSaving}
            className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${hasChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }
            ${saveSuccess ? 'bg-green-600 dark:bg-green-700' : ''}
          `}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                সেভ হচ্ছে...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                সেভ হয়েছে
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                ক্রম সেভ করুন
              </>
            )}
          </button>

          {hasChanges && !saveSuccess && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>সতর্কতা:</strong> আপনার পরিবর্তনগুলো এখনো সেভ হয়নি। ক্রম সেভ করুন বাটনে ক্লিক করুন।
              </p>
            </div>
          )}
        </div>

        {/* Scrollable List Container */}
        <div
          ref={containerRef}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
              border-2 rounded-lg p-4 cursor-move transition-all duration-200
              ${draggedItem === index
                  ? 'opacity-50 scale-95'
                  : dragOverIndex === index
                    ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500'
                }
              hover:shadow-md
            `}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full">
                  <span className="text-xl text-gray-500 dark:text-gray-200">#{index + 1}</span>
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="line-clamp-2 text-sm md:text-base text-gray-800 dark:text-gray-100">
                      {article.title}
                      <span className="text-blue-400 hidden md:inline dark:text-blue-400 text-xs ml-1">
                        {article.created_at_ago}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(article.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 
                                 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/50 
                                 rounded transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-xl p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">নিশ্চিত করুন</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    এই সংবাদটি মুছে ফেলতে চান?
                  </p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                  {articles.find(a => a.id === deleteConfirm)?.title}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 
                           dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                           rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => handleDeleteConfirm(deleteConfirm)}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SortableNewsList;
