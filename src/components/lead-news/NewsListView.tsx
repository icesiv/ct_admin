"use client";
import React, { useState, useEffect } from 'react';
import { Edit, Filter, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';
import MultiselectDropdown from '@/components/ui/dropdown/MultiselectDropdown';

import { useModal } from "../../hooks/useModal";
import Pagination from '../tables/Pagination';

// Type definitions
interface Category {
    id: number;
    name: string;
}

interface NewsArticle {
    id: number;
    title: string;
    summary?: string;
    post_content: string;
    image: string;
    category?: Category;
    created_at_ago: string;
}

interface PaginationData {
    last_page: number;
    total: number;
}

interface ApiResponse {
    success: boolean;
    posts: NewsArticle[];
    pagination: PaginationData;
}

interface User {
    name: string;
    // Add other user properties as needed
}

interface AuthContextType {
    news_categories: Category[];
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    handleLogout: () => void;
    router: {
        push: (path: string) => void;
    };
}

const NewsListView: React.FC = () => {

    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [tmp_lead_news, setTmpLeadnews] = useState<NewsArticle | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    const { news_categories, user, loading, isAuthenticated, handleLogout, router } = useAuth() as AuthContextType;

    // State for news data and loading
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<Category[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalNews, setTotalNews] = useState<number>(0);

    const fetchLeadNews = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');
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
                throw new Error('Failed to fetch news data');
            }

            const data: ApiResponse = await response.json();
            if (data.success) {
                setArticles(data.posts);
            } else {
                throw new Error('API returned unsuccessful response');
            }
        } catch (err) {
            console.error('Error fetching news:', err);
        }
    };

    // Fetch news data
    const fetchNews = async (page: number = 1): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        setIsLoadingNews(true);
        try {
            const ids = selectedCategory.map(c => c.id).join(',');
            // Build API URL with pagination and category filter
            const url = selectedCategory.length === 0
                ? `${BASE_URL}admin/posts/allposts?page=${page}`
                : `${BASE_URL}admin/posts/categories/${ids}?page=${page}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch news data');
            }

            const data: ApiResponse = await response.json();

            if (data.success) {
                setNewsData(data.posts);
                setTotalPages(data.pagination.last_page);
                setTotalNews(data.pagination.total);
                setError(null);
                await fetchLeadNews();
            } else {
                throw new Error('API returned unsuccessful response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            console.error('Error fetching news:', err);
        } finally {
            setIsLoadingNews(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated && news_categories.length > 0) {
            fetchNews(1);
        }
    }, []);

    // Handle category change
    const handleCategoryChange = (category: Category[]): void => {
        setSelectedCategory(category);
        setCurrentPage(1);
        fetchNews(1);
    };

    // Handle page change
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        fetchNews(page);
    };

    // Handle edit button click
    const handleEdit = (newsId: number): void => {
        // ToDo: Navigate to edit page
        router.push(`/news/edit/${newsId}`);
    };

    // Authentication check
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div>
            {/* Category Filter */}
            <MultiselectDropdown
                resetDropSelected={setSelectedCategory}
                news_categories={news_categories}
                handleCategoryChange={handleCategoryChange}
            />

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="text-red-800">
                        <strong>error:</strong> {error}
                    </div>
                    <button
                        onClick={() => fetchNews(currentPage)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Please Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoadingNews && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
            )}

            {/* No Results Message */}
            {!isLoadingNews && newsData.length === 0 && !error && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Filter className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">কোন সংবাদ পাওয়া যায়নি</h3>
                    <p className="text-gray-600">
                        {selectedCategory.length === 0
                            ? 'কোন সংবাদ নেই।'
                            : `"${selectedCategory[0]?.name}" বিভাগে কোন সংবাদ নেই।`
                        }
                    </p>
                </div>
            )}

            {/* News Grid */}
            {!isLoadingNews && newsData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {newsData.map((news) => (
                        <div key={news.id} className="bg-white dark:bg-gray-800  rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* Image */}
                            <div className="h-48 w-full">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=250&fit=crop';
                                    }}
                                />
                            </div>

                            <div className="flex justify-between px-2 py-4">
                                {/* Content */}
                                <div className="text-start">
                                    {/* ID */}
                                    <p className="text-xs ">
                                        ID: {news.id}
                                        {/* Status */}
                                        <span className="ml-2 text-xs text-green-500">
                                            Status: Published
                                        </span>
                                    </p>

                                    <h2 className="font-semibold dark:text-amber-100  line-clamp-2 mb-2">
                                        {news.title}
                                    </h2>

                                    {/* Date */}
                                    <div className="text-xs text-gray-500">
                                        {news.category && (
                                            <span>{news.category.name}</span>
                                        )}
                                        <span className="ml-2" />{news.created_at_ago}
                                    </div>

                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col space-y-3">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => handleEdit(news.id)}
                                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
                                        title="Edit Post"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>

                                    {/* Make Lead News Button - only show if NOT in lead */}
                                    {!articles.some(article => article.id === news.id) && (
                                        <button
                                            onClick={async () => {
                                                setTmpLeadnews(news);
                                                setShowConfirmModal(true);
                                            }}
                                            className="bg-yellow-500 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
                                            title="Make Lead News"
                                        >
                                            <Star className="h-4 w-4" />
                                        </button>
                                    )}

                                    {/* Already in Lead Button - only show if IS in lead */}
                                    {articles.some(article => article.id === news.id) && (
                                        <button
                                            className="bg-green-500 bg-opacity-90 text-white p-2 rounded-full shadow-md cursor-not-allowed"
                                            title="Already in Lead News"
                                            disabled
                                        >
                                            <Star className="h-4 w-4 fill-current" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* Pagination */}
            {
                !isLoadingNews && newsData.length > 0 && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} Of {totalPages}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )
            }

            {/* ToDo: Confirmation Modal */}

        </div >
    );
};

export default NewsListView;