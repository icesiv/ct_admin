'use client';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import React, { useEffect, useState } from "react";

import SortableNewsList from "@/components/lead-news/SortableNewsList";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";


// Type definitions
interface Article {
  id: string;
  title: string;
  order: number;
  image: string;
  category: Category;
  created_at_ago: string;
}

interface Category {
  id: string;
  name: string;
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



export default function BreakingNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsId, setNewsId] = useState<string>("");
  const [newsTitle, setNewsTitle] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { authFetch } = useAuth();

  const fetchLeadNews = async (): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    setIsLoading(true);

    try {
      const url = `${BASE_URL}admin/posts/breakingnews`;
      const response = await authFetch(url, {
        method: 'GET',
        headers: {
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
      const response = await authFetch(url, {
        method: 'GET',
        headers: {
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
      await authFetch(`${BASE_URL}admin/posts/breakingnews`, {
        method: 'POST',
        headers: {
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
      <PageBreadcrumb pageTitle="Breaking News Page" />

      {/* Sort Lead News */}
      <SortableNewsList
        fetchLeadNews={fetchLeadNews}
        leadPosts={articles}
        mode="breakingnews"
      />
    </div>
  );
}