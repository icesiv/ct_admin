"use client";
import React, { useEffect, useState } from 'react';
import { GripVertical, Calendar, Tag, X, Trash2, Save, Check } from 'lucide-react';
import { BASE_URL } from '@/config/config';

// Type definitions
interface Category {
  name: string;
}

interface Article {
  id: number;
  title: string;
  image: string;
  summary?: string;
  category: Category;
  created_at_ago: string;
}

interface OrderData {
  id: number;
  position: number;
}

interface SortedOrderItem {
  position: number;
  id: number;
  title: string;
}

interface ApiResponse {
  success: boolean;
}

interface SortableNewsListProps {
  leadPosts: Article[];
  fetchLeadNews: () => Promise<void>;
}

const SortableNewsList: React.FC<SortableNewsListProps> = () => {
  const [leadPosts, fetchLeadNews] = useState([]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sortedOrder, setSortedOrder] = useState<SortedOrderItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setArticles(leadPosts);
  }, [leadPosts]);

  const deleteLeadNews = async (news_id: number): Promise<void> => {
    const url = `${BASE_URL}admin/posts/leadnews/remove`;
    const authtoken = localStorage.getItem('auth_token');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authtoken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ news_id: news_id })
      });
      console.log('response', response);
    } catch (e) {
      console.error('Error deleting lead news:', e);
    }
  };

  const saveOrder = async (): Promise<void> => {
    const authtoken = localStorage.getItem('auth_token');
    const url = `${BASE_URL}admin/posts/leadnews/reorder`;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const orderData: OrderData[] = articles.map((article, index) => ({
        id: article.id,
        position: index + 1
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authtoken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: orderData })
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Reset success state after 3 seconds
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error saving order:', err);
      // You might want to show an error message to the user here
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
    setHasChanges(true); // Mark that changes have been made

    // Update sorted order
    const newOrder: SortedOrderItem[] = newArticles.map((article, index) => ({
      position: index + 1,
      id: article.id,
      title: article.title
    }));
    setSortedOrder(newOrder);

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (): void => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDeleteClick = async (articleId: number): Promise<void> => {
    setDeleteConfirm(articleId);
  };

  const handleDeleteConfirm = async (articleId: number): Promise<void> => {
    await deleteLeadNews(articleId);
    await fetchLeadNews();
    const newArticles = articles.filter(article => article.id !== articleId);
    setArticles(newArticles);

    // Update sorted order after deletion
    const newOrder: SortedOrderItem[] = newArticles.map((article, index) => ({
      position: index + 1,
      id: article.id,
      title: article.title
    }));
    setSortedOrder(newOrder);

    setDeleteConfirm(null);
  };

  const handleDeleteCancel = (): void => {
    setDeleteConfirm(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAzMkw0MCA0NEw1MiAzMkw2MCA0MEw2MCA2MEgyMFY0MEwyOCAzMloiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iNCIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Sequence saved successfully.</span>
          </div>
        </div>
      )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Drag News To Sort
          </h3>


          {/* Save Button */}
          <button
            onClick={async () => {
              await saveOrder();
            }}
            disabled={!hasChanges || isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${hasChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
              ${saveSuccess ? 'bg-green-600 text-white' : ''}
            `}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Save Done
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>

        {hasChanges && !saveSuccess && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>সতর্কতা:</strong> আপনার পরিবর্তনগুলো এখনো সেভ হয়নি। ক্রম সেভ করুন বাটনে ক্লিক করুন।
            </p>
          </div>
        )}

        <div className="space-y-4">
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
                bg-white border-2 rounded-lg p-4 cursor-move transition-all duration-200
                ${draggedItem === index ? 'opacity-50 scale-95' : ''}
                ${dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                ${draggedItem === index ? 'border-blue-300' : ''}
                hover:shadow-md
              `}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">নিশ্চিত করুন</h3>
                          <p className="text-sm text-gray-600">এই সংবাদটি মুছে ফেলতে চান?</p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium">
                          {articles.find(a => a.id === deleteConfirm)?.title}
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={handleDeleteCancel}
                          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={async () => await handleDeleteConfirm(deleteConfirm)}
                          className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-shrink-0">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={handleImageError}
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <span className="text-sm text-gray-500">
                        #{index + 1}
                      </span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleDeleteClick(article.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {article.summary && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {article.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.created_at_ago}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>নির্দেশনা:</strong> যেকোনো সংবাদ আইটেমের বাম পাশের গ্রিপ আইকন ধরে টেনে নিয়ে অন্য জায়গায় ছেড়ে দিন।
            সাজানোর পর উপরের "ক্রম সেভ করুন" বাটনে ক্লিক করে নতুন ক্রম সংরক্ষণ করুন। ডান পাশের ট্র্যাশ আইকনে ক্লিক করে যেকোনো সংবাদ মুছে ফেলতে পারেন।
          </p>
        </div>
    </div>
  );
};

export default SortableNewsList;