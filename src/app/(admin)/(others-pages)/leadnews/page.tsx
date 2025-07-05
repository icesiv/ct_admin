'use client';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import React, { useEffect, useState } from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import SortableNewsList from "@/components/lead-news/SortableNewsList";
import { BASE_URL } from "@/config/config";

// Type definitions
interface Article {
  id: string;
  title: string;
  order: number;
  // Add other properties as needed based on your API response
}

interface SmallButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface ApiResponse {
  success: boolean;
  posts: Article[];
  message?: string;
}



export default function LeadNews(): JSX.Element {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsId, setNewsId] = useState<string>("");
  const [newsTitle, setNewsTitle] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLeadNews = async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    setIsLoading(true);

    try {
      const url = `${BASE_URL}admin/posts/leadnews`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      if (data.success) {
        setArticles(data.posts);
      } else {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      // You might want to add error handling/notification here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadNews();
  }, []);
  const handleGetNews = async (): Promise<void> => {
    if (!newsId.trim()) {
      alert('Please enter a News ID');
      return;
    }

    const token = localStorage.getItem('auth_token');
    setIsLoading(true);

    try {
      const url = `${BASE_URL}posts/${newsId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.detail) {
        setNewsTitle(data.detail.title);
      } else {
        throw new Error('News not found');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsTitle('');
      alert('Failed to fetch news. Please check the ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = (): void => {
    setNewsId("");
    setNewsTitle("");
    setSelectedOrder(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newsId.trim() || !newsTitle.trim()) {
      alert('Please get a valid news first');
      return;
    }


    const token = localStorage.getItem('auth_token');
    try {

      // Add your API call here to make the news lead with the selected position
      await fetch(`${BASE_URL}admin/posts/leadnews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: selectedOrder,
          news_id: newsId
        })
      });
      await fetchLeadNews();
      handleClearForm();
      // For now, just close the modal and refresh the data

    } catch (err) {
      console.error('Error making lead news:', err);
      // You can add error notification here
    }
    // Add your submit logic here
    console.log('Submitting:', { newsId, newsTitle, selectedOrder });
  };

  const SmallButton: React.FC<SmallButtonProps> = ({
    text,
    onClick,
    disabled = false,
    className = ""
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`h-11 border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm transition rounded-lg shadow-theme-xs hover:bg-brand-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {text}
      </button>
    );
  };
  return (
    <div>
      <PageBreadcrumb pageTitle="LeadNews Page" />

      {/* Add News To Lead */}
      <div className="rounded-2xl md:border md:border-gray-200 md:bg-white md:px-4 py-6 md:dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <h3 className="mb-6 font-semibold text-center text-gray-800 dark:text-white/90 text-xl lg:text-2xl">
            Add a News To Lead Section
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* News ID Section */}
              <div className="space-x-4 flex flex-row justify-between items-end">
                <div className="w-full">
                  <Label>
                    News ID<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="n_id"
                    name="n_id"
                    placeholder="Enter News ID"
                    defaultValue={newsId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewsId(e.target.value)}
                  />
                </div>

                <SmallButton
                  text="X"
                  onClick={handleClearForm}
                  disabled={isLoading}
                />
                <SmallButton
                  text="Get"
                  onClick={handleGetNews}
                  disabled={isLoading || !newsId.trim()}
                />
              </div>

              {/* News Title Section */}
              <div>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="News Title will be here"
                  defaultValue={newsTitle}

                />
              </div>

              <div className="flex space-x-4 items-end">
                <div className="w-full">
                  <Label>
                    Pick Order<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="order"
                    name="order"
                    value={selectedOrder}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOrder(Number(e.target.value))}
                    className="h-11 w-full text-center rounded-lg border py-2.5 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 0 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((num: number) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !newsTitle.trim()}
                  className="h-11 px-4 py-3 md:w-38 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : (
                    <>Set<span className="hidden md:inline"> Position</span></>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sort Lead News */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SortableNewsList
          fetchLeadNews={fetchLeadNews}
          leadPosts={articles}
        />
      </div>
    </div>
  );
}