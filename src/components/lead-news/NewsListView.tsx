"use client";
import React, { useState, useEffect } from 'react';
import { Edit, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';
import Pagination from '../tables/Pagination';

// Type definitions
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
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    handleLogout: () => void;
    router: {
        push: (path: string) => void;
    };
}

const NewsListView: React.FC = () => {
    const { user, loading, isAuthenticated, router } = useAuth() as AuthContextType;

    // State for news data and loading
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalNews, setTotalNews] = useState<number>(0);

    // Fetch news data
    const fetchNews = async (page: number = 1): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        setIsLoadingNews(true);
        try {
            const url = `${BASE_URL}admin/posts/allposts?per_page=24&page=${page}`;

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
        if (isAuthenticated) {
            fetchNews(1);
        }
    }, [isAuthenticated]);

    // Handle page change
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        fetchNews(page);
    };

    // Handle edit button click
    const handleEdit = (newsId: number): void => {
        router.push(`/posts/edit/${newsId}`);
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
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="text-red-800">
                        <strong>Error:</strong> {error}
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
                    <p className="text-gray-600">কোন সংবাদ নেই।</p>
                </div>
            )}

            {/* News Table */}
            {!isLoadingNews && newsData.length > 0 && (
                <div className="mt-6 mb-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left min-w-[200px] text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 hidden md:block py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        By
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {newsData.map((news) => (
                                    <tr key={news.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <td className="px-6 text-sm text-gray-900 dark:text-gray-100">
                                                {news.post_status === 1 ?
                                                    <span className="text-green-500">{news.id}</span> :
                                                    <span className="text-red-500">{news.id}</span>
                                                }
                                        </td>
                                        <td className="px-6 py-2 text-left text-sm text-gray-900 dark:text-amber-100">
                                            {news.title}
                                        </td>
                                        <td className="px-6 hidden md:block py-2 text-left whitespace-nowrap text-sm text-gray-500">
                                            {news.category_slug}
                                        </td>
                                        <td className="px-6 py-2 text-left whitespace-nowrap text-sm text-gray-500">
                                            {news.created_by}<br />
                                            {news.created_at_ago}
                                        </td>
                                        <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(news.id)}
                                                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 mr-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
                                                title="Edit Post"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!isLoadingNews && newsData.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({totalNews} total news)
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};

export default NewsListView;