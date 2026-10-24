'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';
import {
  Trophy,
  Flame,
  TrendingUp,
  Eye,
  Calendar,
  Download,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Tag,
  User,
  Sparkles,
  BarChart3,
  Award,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface TopPostItem {
  id: string | number;
  title: string;
  category: string;
  category_slug?: string;
  categories?: { id: number; name: string; slug: string }[];
  author: string;
  views: number;
  all_time_views?: number;
  date: string;
  created_at_ago?: string;
  trend?: 'viral' | 'rising' | 'steady';
  featured_image?: string | null;
  slug?: string;
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function TopPostReportPage() {
  const { user, loading: authLoading, authFetch, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'this_month' | 'all'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TopPostItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch actual data from ct-api
  const fetchTopPosts = useCallback(async () => {
    setLoading(true);
    try {
      let dataLoaded = false;
      const fetcher = authFetch || fetch;

      // Tier 1: Try dedicated admin report endpoint first
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('days', timeRange);
        if (selectedCategory !== 'all') {
          queryParams.set('category', selectedCategory);
        }
        queryParams.set('limit', '50');
        if (debouncedSearch) {
          queryParams.set('search', debouncedSearch);
        }

        const res = await fetcher(`${BASE_URL}admin/report/top-posts?${queryParams.toString()}`);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.posts)) {
            setPosts(json.posts);
            if (Array.isArray(json.categories) && json.categories.length > 0) {
              setCategories(json.categories);
            }
            dataLoaded = true;
          }
        }
      } catch (e) {
        // Fallback
      }

      // Tier 2: Try public top-posts endpoint
      if (!dataLoaded) {
        try {
          const queryParams = new URLSearchParams();
          queryParams.set('days', timeRange);
          if (selectedCategory !== 'all') {
            queryParams.set('category', selectedCategory);
          }
          queryParams.set('limit', '50');
          if (debouncedSearch) {
            queryParams.set('search', debouncedSearch);
          }

          const res = await fetcher(`${BASE_URL}top-posts?${queryParams.toString()}`);
          if (res && res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.posts)) {
              setPosts(json.posts);
              if (Array.isArray(json.categories) && json.categories.length > 0) {
                setCategories(json.categories);
              }
              dataLoaded = true;
            }
          }
        } catch (e) {
          // Fallback
        }
      }

      // Tier 3: Fallback to admin/posts/allposts ordered by view_count
      if (!dataLoaded) {
        try {
          const daysParam =
            timeRange === 'all'
              ? 'all'
              : timeRange === 'today'
              ? '1'
              : timeRange === '7d'
              ? '7'
              : timeRange === '30d'
              ? '30'
              : '30';

          const url = `${BASE_URL}admin/posts/allposts?order_by=view_count&order_direction=desc&per_page=50&days=${daysParam}${
            debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''
          }`;

          const res = await fetcher(url);
          if (res && res.ok) {
            const json = await res.json();
            const rawPosts: any[] = json.posts || [];
            if (rawPosts.length > 0) {
              const maxV = Math.max(...rawPosts.map((p) => p.view_count || 0), 1);
              const mapped: TopPostItem[] = rawPosts.map((p, idx) => {
                const v = p.view_count || 0;
                let trend: 'viral' | 'rising' | 'steady' = 'steady';
                if (idx === 0 || v >= 50000 || v / maxV >= 0.7) trend = 'viral';
                else if (idx < 5 || v >= 10000 || v / maxV >= 0.3) trend = 'rising';

                const primaryCat =
                  p.categories && p.categories.length > 0 ? p.categories[0].name : 'General';
                const catSlug =
                  p.categories && p.categories.length > 0 ? p.categories[0].slug : '';

                return {
                  id: p.id,
                  title: p.title || 'Untitled',
                  category: primaryCat,
                  category_slug: catSlug,
                  categories: p.categories || [],
                  author: p.created_by || p.author || 'Admin',
                  views: v,
                  all_time_views: v,
                  date: p.created_at ? p.created_at.slice(0, 10) : '',
                  created_at_ago: p.created_at_ago || '',
                  trend,
                  featured_image: p.image || null,
                  slug: p.slug || '',
                };
              });

              // Filter by category if selected
              const filtered =
                selectedCategory === 'all'
                  ? mapped
                  : mapped.filter(
                      (p) =>
                        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
                        p.category_slug?.toLowerCase() === selectedCategory.toLowerCase()
                    );

              setPosts(filtered);
              dataLoaded = true;
            }
          }
        } catch (e) {
          console.error('Failed to load fallback posts:', e);
        }
      }

      if (!dataLoaded) {
        setPosts([]);
      }
    } catch (err) {
      console.error('Failed to fetch top posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, timeRange, selectedCategory, debouncedSearch]);

  // Load posts whenever dependencies change
  useEffect(() => {
    if (isAuthenticated && user?.is_super_admin) {
      fetchTopPosts();
    }
  }, [fetchTopPosts, isAuthenticated, user?.is_super_admin]);

  // Also fetch categories if not yet loaded
  useEffect(() => {
    if (!isAuthenticated || !user?.is_super_admin) return;
    const loadCategories = async () => {
      if (categories.length > 0) return;
      try {
        const fetcher = authFetch || fetch;
        const res = await fetcher(`${BASE_URL}admin/categories`);
        if (res && res.ok) {
          const json = await res.json();
          const list: any[] = json.data || json.categories || [];
          if (Array.isArray(list) && list.length > 0) {
            setCategories(
              list.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))
            );
          }
        }
      } catch (err) {
        // ignore
      }
    };

    loadCategories();
  }, [authFetch, categories.length, isAuthenticated, user?.is_super_admin]);

  // Filtered top posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        p.category === selectedCategory ||
        p.category_slug === selectedCategory;

      const matchesSearch =
        debouncedSearch === '' ||
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.author.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, debouncedSearch]);

  // Metrics
  const maxViews = useMemo(() => {
    return Math.max(...filteredPosts.map((p) => p.views), 1);
  }, [filteredPosts]);

  const stats = useMemo(() => {
    const totalViews = filteredPosts.reduce((acc, p) => acc + p.views, 0);
    const avgViews = filteredPosts.length > 0 ? Math.round(totalViews / filteredPosts.length) : 0;
    const topPost = filteredPosts[0];

    // Category with highest aggregate views
    const catViews: Record<string, number> = {};
    filteredPosts.forEach((p) => {
      catViews[p.category] = (catViews[p.category] || 0) + p.views;
    });
    let topCategory = 'N/A';
    let topCatCount = 0;
    Object.entries(catViews).forEach(([cat, v]) => {
      if (v > topCatCount) {
        topCatCount = v;
        topCategory = cat;
      }
    });

    return {
      totalViews,
      avgViews,
      topPost,
      topCategory,
    };
  }, [filteredPosts]);

  // CSV export handler
  const handleExportCSV = () => {
    const headers = ['Rank', 'Post ID', 'Title', 'Category', 'Author', 'Views', 'Date', 'Trend'];
    const rows = filteredPosts.map((p, index) => [
      index + 1,
      String(p.id),
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.author}"`,
      p.views,
      p.date,
      p.trend || 'steady',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `top_posts_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          the required privileges to view top post reports.
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageBreadcrumb pageTitle="Top Posts Report" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-xs">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Top Performing Posts</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Leaderboard of the most read and trending stories from ct-api
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchTopPosts()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Time range selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            {(['today', '7d', '30d', 'this_month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range === 'today'
                  ? 'Today'
                  : range === '7d'
                  ? '7 Days'
                  : range === '30d'
                  ? '30 Days'
                  : range === 'this_month'
                  ? 'This Month'
                  : 'All Time'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredPosts.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* #1 Post Highlight */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent bg-white dark:bg-gray-800 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              #1 Ranked Article
            </span>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
              👑 Leader
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {stats.topPost ? stats.topPost.title : loading ? 'Loading...' : 'No data available'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate max-w-[140px]">
              By {stats.topPost ? stats.topPost.author : '-'}
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm whitespace-nowrap">
              {stats.topPost ? stats.topPost.views.toLocaleString() : 0} views
            </span>
          </div>
        </div>

        {/* Total Views across Top Posts */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Top Views
            </span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Across {filteredPosts.length} selected articles
          </p>
        </div>

        {/* Average Views */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg Views / Top Post
            </span>
            <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.avgViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Strong reader engagement benchmark
          </p>
        </div>

        {/* Top Category */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Top Category
            </span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {stats.topCategory}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Most trending category by volume
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search top posts by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs sm:text-sm font-semibold bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200 cursor-pointer"
          >
            <option value="all">All Categories (সকল ক্যাটাগরি)</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-gray-900 dark:text-white text-base">
              Ranked Leaderboard ({filteredPosts.length} posts)
            </h2>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Sorted by total reads from ct-api
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 dark:bg-gray-700/30 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Article Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Views</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Loading top posts from ct-api database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 dark:text-gray-400">
                    <p className="font-semibold text-sm">কোনো আর্টিকেল পাওয়া যায়নি।</p>
                    <p className="text-xs text-gray-400 mt-1">
                      অন্য কোনো ক্যাটাগরি, সময়সীমা অথবা সার্চ কিওয়ার্ড দিয়ে চেষ্টা করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, idx) => {
                  const rank = idx + 1;
                  const viewPercentage = Math.round((post.views / maxViews) * 100);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors group"
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-extrabold text-sm shadow-sm ring-2 ring-amber-300/40">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200 font-extrabold text-sm ring-1 ring-slate-300/40">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 font-extrabold text-sm ring-1 ring-orange-300/40">
                            🥉 3
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-xs">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Title & Thumbnail & View Volume Bar */}
                      <td className="py-4 px-4 max-w-md">
                        <div className="flex items-center gap-3">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-12 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-700"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/posts/edit/${post.id}`}
                              className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                              title={post.title}
                            >
                              {post.title}
                            </Link>
                            {/* Visual view volume bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  rank === 1
                                    ? 'bg-amber-500'
                                    : rank <= 3
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.max(viewPercentage, 3)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                          {post.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {post.author ? post.author.charAt(0).toUpperCase() : 'U'}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 text-xs font-medium truncate max-w-[120px]">
                            {post.author}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {post.date || '--'}
                          </span>
                          {post.created_at_ago && (
                            <span className="text-[10px] text-gray-400">
                              {post.created_at_ago}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          {post.views.toLocaleString()}
                        </span>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500">
                          {viewPercentage}% of #1
                        </div>
                      </td>

                      {/* Trend indicator */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {post.trend === 'viral' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50">
                            <Flame className="w-3.5 h-3.5" /> Viral
                          </span>
                        ) : post.trend === 'rising' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                            <TrendingUp className="w-3.5 h-3.5" /> Rising
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Steady
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/posts/edit/${post.id}`}
                            title="Edit Post"
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <a
                            href={`https://campustimes.press/posts/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open on live site"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
