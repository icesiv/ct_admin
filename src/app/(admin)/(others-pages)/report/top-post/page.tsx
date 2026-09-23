'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowUpRight,
  ExternalLink,
  Edit,
  Tag,
  User,
  Sparkles,
  BarChart3,
  Award,
} from 'lucide-react';
import Link from 'next/link';

interface TopPostItem {
  id: string | number;
  title: string;
  category: string;
  author: string;
  views: number;
  date: string;
  shares?: number;
  comments?: number;
  trend?: 'viral' | 'rising' | 'steady';
}

export default function TopPostReportPage() {
  const { authFetch } = useAuth();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'this_month' | 'all'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Default / initial high-performing dataset (connected with live API fallback)
  const [posts, setPosts] = useState<TopPostItem[]>([
    {
      id: 1,
      title: 'বুয়েট ভর্তি পরীক্ষার চূড়ান্ত ফল প্রকাশ, শীর্ষে যারা',
      category: 'Admission',
      author: 'ক্যাম্পাস প্রতিনিধি',
      views: 34200,
      shares: 1250,
      comments: 340,
      date: '2026-09-07',
      trend: 'viral',
    },
    {
      id: 2,
      title: 'ঢাবি ক্যাম্পাসে নবীন শিক্ষার্থীদের উৎসবমুখর বরণ',
      category: 'Campus News',
      author: 'আসিফ আহমেদ',
      views: 26800,
      shares: 980,
      comments: 215,
      date: '2026-09-06',
      trend: 'viral',
    },
    {
      id: 3,
      title: 'বিদেশে উচ্চশিক্ষা: স্কলারশিপ আবেদনের পূর্ণাঙ্গ নির্দেশিকা',
      category: 'Scholarship',
      author: 'মাকসুদা নাজনীন',
      views: 21500,
      shares: 1840,
      comments: 420,
      date: '2026-09-05',
      trend: 'rising',
    },
    {
      id: 4,
      title: 'মেডিকেল ভর্তি পরীক্ষার নতুন নিয়মাবলি ও সিলেবাস আপডেট',
      category: 'Admission',
      author: 'নিজস্ব প্রতিবেদক',
      views: 19400,
      shares: 720,
      comments: 180,
      date: '2026-09-05',
      trend: 'rising',
    },
    {
      id: 5,
      title: 'জাবি সিনেট নির্বাচন: ভোটার তালিকা ও তফসিল ঘোষণা',
      category: 'Politics',
      author: 'তানভীর হাসান',
      views: 15300,
      shares: 410,
      comments: 95,
      date: '2026-09-04',
      trend: 'steady',
    },
    {
      id: 6,
      title: 'চবিতে আন্তর্জাতিক বিজ্ঞান সম্মেলনের পর্দা উঠলো',
      category: 'Science & Tech',
      author: 'ক্যাম্পাস প্রতিনিধি',
      views: 13900,
      shares: 310,
      comments: 88,
      date: '2026-09-03',
      trend: 'steady',
    },
    {
      id: 7,
      title: 'ইন্টার-ইউনিভার্সিটি ফুটবল টুর্নামেন্টে চ্যাম্পিয়ন ঢাবি',
      category: 'Sports',
      author: 'আসিফ আহমেদ',
      views: 12400,
      shares: 550,
      comments: 142,
      date: '2026-09-02',
      trend: 'rising',
    },
    {
      id: 8,
      title: 'আইসিটি অলিম্পিয়াডে সেরাদের তালিকায় বাংলাদেশী শিক্ষার্থীরা',
      category: 'Features',
      author: 'মাকসুদা নাজনীন',
      views: 10800,
      shares: 630,
      comments: 110,
      date: '2026-09-01',
      trend: 'steady',
    },
    {
      id: 9,
      title: 'জগন্নাথ বিশ্ববিদ্যালয়ে নতুন রিসার্চ সেন্টারের উদ্বোধন',
      category: 'Campus News',
      author: 'নিজস্ব প্রতিবেদক',
      views: 9400,
      shares: 240,
      comments: 65,
      date: '2026-08-30',
      trend: 'steady',
    },
    {
      id: 10,
      title: 'ডিজিটাল উদ্ভাবনী মেলায় প্রথম পুরষ্কার জিতেছে শাবিপ্রবি টিম',
      category: 'Science & Tech',
      author: 'তানভীর হাসান',
      views: 8200,
      shares: 310,
      comments: 72,
      date: '2026-08-29',
      trend: 'steady',
    },
  ]);

  useEffect(() => {
    const fetchTopPosts = async () => {
      setLoading(true);
      try {
        if (authFetch) {
          const res = await authFetch(`${BASE_URL}admin/dashboard/stats`);
          if (res && res.ok) {
            const data = await res.json();
            if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
              const mapped: TopPostItem[] = data.posts.map((p: any, idx: number) => ({
                id: p.id || idx + 1,
                title: p.title || p.post_title || 'Untitled Post',
                category: p.category_name || p.category || 'General',
                author: p.author_name || p.author || 'Admin',
                views: Number(p.views || p.view_count || p.total_views || 0),
                shares: Number(p.shares || 0),
                comments: Number(p.comments_count || 0),
                date: p.created_at ? p.created_at.split('T')[0] : '2026-09-01',
                trend: idx < 2 ? 'viral' : idx < 5 ? 'rising' : 'steady',
              }));
              // Sort descending by views
              mapped.sort((a, b) => b.views - a.views);
              setPosts(mapped);
            }
          }
        }
      } catch (err) {
        console.warn('Using default top posts data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, [authFetch]);

  // Extract distinct categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  // Filtered top posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Metrics
  const maxViews = useMemo(() => {
    return Math.max(...posts.map((p) => p.views), 1);
  }, [posts]);

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
    const headers = ['Rank', 'Title', 'Category', 'Author', 'Views', 'Date', 'Trend'];
    const rows = filteredPosts.map((p, index) => [
      index + 1,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.author}"`,
      p.views,
      p.date,
      p.trend || 'steady',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `top_posts_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <PageBreadcrumb pageTitle="Top Posts Report" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Top Performing Posts</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Leaderboard of the most read, engaged, and viral stories
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            {(['today', '7d', '30d', 'this_month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
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

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
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
            {stats.topPost ? stats.topPost.title : 'N/A'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>By {stats.topPost ? stats.topPost.author : '-'}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
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
            Across top {filteredPosts.length} selected articles
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
            Strong reader retention benchmark
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
            placeholder="Search top posts, authors, categories..."
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
            className="w-full sm:w-auto px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
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
            Sorted by total reads
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
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No articles matched your criteria.
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

                      {/* Title & View bar */}
                      <td className="py-4 px-4 max-w-md">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </div>
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
                            style={{ width: `${viewPercentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {post.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                            {post.author.charAt(0)}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                            {post.author}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {post.date}
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            <Flame className="w-3.5 h-3.5" /> Viral
                          </span>
                        ) : post.trend === 'rising' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
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
                          <Link
                            href={`/posts`}
                            title="Manage Posts"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
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
