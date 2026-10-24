'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';
import Pagination from '@/components/tables/Pagination';
import {
  Users,
  Calendar,
  Download,
  Search,
  Eye,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  RefreshCw,
  User as UserIcon,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface UserStat {
  user_id: number;
  user_name: string;
  user_email: string | null;
  is_super_admin: boolean | number | null;
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number | string;
  avg_views: number | string;
}

interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

interface PostItem {
  id: number;
  title: string;
  summary?: string;
  image?: string;
  user_id?: number;
  created_by?: string;
  author?: string;
  post_status: number;
  view_count?: number;
  created_at: string;
  created_at_ago?: string;
  categories?: PostCategory[];
  category_slug?: string;
}

export default function PostByUserReportPage() {
  const { user, loading: authLoading, authFetch, isAuthenticated } = useAuth();

  // Filter States
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d' | '365d'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Data States
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(20);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Convert timeRange string to days number
  const daysParam = useMemo(() => {
    if (timeRange === 'all') return 0;
    return parseInt(timeRange.replace('d', ''), 10) || 0;
  }, [timeRange]);

  // 1. Fetch Users and their post stats with multi-layer fallback
  const fetchUserStats = useCallback(async () => {
    if (!authFetch) return;
    setLoadingUsers(true);
    try {
      let loadedUsers: UserStat[] = [];
      let loadedFromReportStats = false;

      // Tier 1: Try dedicated report stats endpoint first
      try {
        const statsRes = await authFetch(`${BASE_URL}admin/report/post-by-user-stats?days=${daysParam}`);
        if (statsRes && statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success && Array.isArray(statsJson.users) && statsJson.users.length > 0) {
            loadedUsers = statsJson.users.map((u: any) => ({
              user_id: Number(u.user_id),
              user_name: u.user_name || `User #${u.user_id}`,
              user_email: u.user_email || null,
              is_super_admin: u.is_super_admin,
              total_posts: Number(u.total_posts || 0),
              published_posts: Number(u.published_posts || 0),
              draft_posts: Number(u.draft_posts || 0),
              total_views: Number(u.total_views || 0),
              avg_views: Number(u.avg_views || 0),
            }));
            loadedFromReportStats = true;
          }
        }
      } catch (e) {
        // Fallback to admin/user
      }

      // Tier 2: Fallback to admin/user endpoint
      if (!loadedFromReportStats) {
        try {
          const userRes = await authFetch(`${BASE_URL}admin/user?per_page=100`);
          if (userRes && userRes.ok) {
            const userJson = await userRes.json();
            const rawList: any[] = userJson?.data?.users || userJson?.users || [];
            if (Array.isArray(rawList) && rawList.length > 0) {
              loadedUsers = rawList.map((u: any) => ({
                user_id: Number(u.id),
                user_name: u.name || `User #${u.id}`,
                user_email: u.email || null,
                is_super_admin: u.is_super_admin,
                total_posts: 0,
                published_posts: 0,
                draft_posts: 0,
                total_views: 0,
                avg_views: 0,
              }));
            }
          }
        } catch (e) {
          console.error('Failed to load admin/user:', e);
        }

        // Augment with recent posts to discover active creator names and counts
        try {
          const sampleRes = await authFetch(`${BASE_URL}admin/posts/allposts?per_page=100&days=${daysParam}`);
          if (sampleRes && sampleRes.ok) {
            const sampleJson = await sampleRes.json();
            const samplePosts: PostItem[] = sampleJson?.posts || [];

            const userMap = new Map<string, UserStat>();
            loadedUsers.forEach((u) => {
              userMap.set(String(u.user_id), { ...u });
              if (u.user_name) userMap.set(u.user_name.toLowerCase().trim(), { ...u });
            });

            samplePosts.forEach((p) => {
              const creator = (p.created_by || p.author || '').trim();
              const pUid = p.user_id ? String(p.user_id) : null;

              let target =
                (pUid && userMap.get(pUid)) ||
                (creator && userMap.get(creator.toLowerCase())) ||
                null;

              if (!target && (pUid || creator)) {
                const newId = pUid ? Number(pUid) : Math.floor(Math.random() * 8000) + 1000;
                target = {
                  user_id: newId,
                  user_name: creator || `User #${newId}`,
                  user_email: null,
                  is_super_admin: false,
                  total_posts: 0,
                  published_posts: 0,
                  draft_posts: 0,
                  total_views: 0,
                  avg_views: 0,
                };
                userMap.set(String(newId), target);
                if (creator) userMap.set(creator.toLowerCase(), target);
              }

              if (target) {
                target.total_posts = (target.total_posts || 0) + 1;
                if (p.post_status === 1) target.published_posts = (target.published_posts || 0) + 1;
                else target.draft_posts = (target.draft_posts || 0) + 1;
                target.total_views = Number(target.total_views || 0) + (p.view_count || 0);
                target.avg_views = Math.round(Number(target.total_views) / target.total_posts);
              }
            });

            const unique: UserStat[] = [];
            const seen = new Set<number>();
            userMap.forEach((u) => {
              if (!seen.has(u.user_id)) {
                seen.add(u.user_id);
                unique.push(u);
              }
            });
            loadedUsers = unique.sort((a, b) => b.total_posts - a.total_posts);
          }
        } catch (e) {
          // ignore
        }
      }

      if (loadedUsers.length > 0) {
        setUsers(loadedUsers);
      }
    } catch (err) {
      console.error('Failed to load user post stats:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [authFetch, daysParam]);

  // 2. Fetch Posts by selected user_id
  const fetchPosts = useCallback(
    async (page: number = 1) => {
      if (!authFetch) return;
      setLoadingPosts(true);
      try {
        let url = `${BASE_URL}admin/posts/allposts?per_page=${perPage}&page=${page}&days=${daysParam}`;

        if (selectedUserId !== 'all') {
          url += `&user_id=${selectedUserId}`;
        }
        if (statusFilter !== 'all') {
          url += `&status=${statusFilter}`;
        }
        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}&search_by=title`;
        }

        const res = await authFetch(url);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success) {
            const rawPosts: PostItem[] = json.posts || [];
            setPosts(rawPosts);
            setTotalPages(json.pagination?.last_page || Math.ceil(rawPosts.length / perPage) || 1);
            setTotalPostsCount(json.pagination?.total || rawPosts.length);
          }
        }
      } catch (err) {
        console.error('Failed to load posts by user:', err);
      } finally {
        setLoadingPosts(false);
      }
    },
    [authFetch, perPage, daysParam, selectedUserId, statusFilter, debouncedSearch]
  );

  // Load user stats whenever timeRange changes
  useEffect(() => {
    if (isAuthenticated && user?.is_super_admin) {
      fetchUserStats();
    }
  }, [isAuthenticated, user?.is_super_admin, fetchUserStats]);

  // Load posts whenever dependencies change
  useEffect(() => {
    if (isAuthenticated && user?.is_super_admin) {
      fetchPosts(currentPage);
    }
  }, [isAuthenticated, user?.is_super_admin, currentPage, fetchPosts]);

  // When user_id, status, or perPage changes, reset to page 1
  const handleUserChange = (val: string) => {
    setSelectedUserId(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: 'all' | 'published' | 'draft') => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleTimeRangeChange = (val: any) => {
    setTimeRange(val);
    setCurrentPage(1);
  };

  // Client-side filtering when backend hasn't filtered by user_id
  const displayedPosts = useMemo(() => {
    if (selectedUserId === 'all') return posts;

    const currentIdStr = String(selectedUserId);
    const selectedUser = users.find((u) => String(u.user_id) === currentIdStr);
    const uName = selectedUser?.user_name?.toLowerCase().trim();

    const serverFiltered =
      posts.length > 0 &&
      posts.every((p) => {
        const idMatches = p.user_id && String(p.user_id) === currentIdStr;
        const nameMatches = uName && p.created_by && p.created_by.toLowerCase().trim() === uName;
        return idMatches || nameMatches;
      });

    if (serverFiltered) return posts;

    return posts.filter((p) => {
      const idMatches = p.user_id && String(p.user_id) === currentIdStr;
      const nameMatches = uName && p.created_by && p.created_by.toLowerCase().trim() === uName;
      const authorMatches = uName && p.author && p.author.toLowerCase().trim() === uName;
      return idMatches || nameMatches || authorMatches;
    });
  }, [posts, selectedUserId, users]);

  const displayedTotalCount = useMemo(() => {
    if (selectedUserId === 'all') return totalPostsCount;
    if (displayedPosts.length < posts.length) {
      return displayedPosts.length;
    }
    return totalPostsCount || displayedPosts.length;
  }, [selectedUserId, totalPostsCount, displayedPosts.length, posts.length]);

  // Active statistics for selected user or combined all users
  const activeStats = useMemo(() => {
    if (selectedUserId === 'all') {
      const sumPosts = users.reduce((sum, u) => sum + (u.total_posts || 0), 0);
      const sumViews = users.reduce((sum, u) => sum + Number(u.total_views || 0), 0);
      const sumPublished = users.reduce((sum, u) => sum + (u.published_posts || 0), 0);
      const sumDrafts = users.reduce((sum, u) => sum + (u.draft_posts || 0), 0);
      const effectiveTotalPosts = Math.max(sumPosts, totalPostsCount);
      const avgViews = effectiveTotalPosts > 0 ? Math.round(sumViews / effectiveTotalPosts) : 0;

      return {
        name: 'All Registered Creators & Staff',
        userId: 'All User IDs',
        role: `${users.length > 0 ? users.length : 'Multiple'} Active Contributors with Posts`,
        totalPosts: effectiveTotalPosts,
        published: sumPublished > 0 ? sumPublished : totalPostsCount,
        drafts: sumDrafts,
        totalViews: sumViews,
        avgViews: avgViews,
      };
    }

    const currentIdStr = String(selectedUserId);
    const found = users.find(
      (u) =>
        String(u.user_id) === currentIdStr ||
        (u.user_name && u.user_name.toLowerCase().trim() === selectedUserId.toLowerCase().trim())
    );

    if (found) {
      const totalUserPosts = found.total_posts > 0 ? found.total_posts : displayedPosts.length;
      const totalUserViews = Number(found.total_views) > 0
        ? Number(found.total_views)
        : displayedPosts.reduce((sum, p) => sum + (p.view_count || 0), 0);
      const avgUserViews = totalUserPosts > 0 ? Math.round(totalUserViews / totalUserPosts) : 0;

      return {
        name: found.user_name,
        userId: `user_id: ${found.user_id}`,
        role: found.is_super_admin
          ? 'Super Administrator'
          : found.user_email
            ? found.user_email
            : 'Staff Contributor',
        totalPosts: totalUserPosts,
        published: found.published_posts > 0 ? found.published_posts : displayedPosts.filter(p => p.post_status === 1).length,
        drafts: found.draft_posts > 0 ? found.draft_posts : displayedPosts.filter(p => p.post_status === 0).length,
        totalViews: totalUserViews,
        avgViews: avgUserViews,
      };
    }

    return {
      name: `User #${selectedUserId}`,
      userId: `user_id: ${selectedUserId}`,
      role: 'Staff Author',
      totalPosts: displayedTotalCount,
      published: displayedPosts.filter(p => p.post_status === 1).length || displayedTotalCount,
      drafts: displayedPosts.filter(p => p.post_status === 0).length,
      totalViews: displayedPosts.reduce((sum, p) => sum + (p.view_count || 0), 0),
      avgViews: displayedPosts.length > 0 ? Math.round(displayedPosts.reduce((sum, p) => sum + (p.view_count || 0), 0) / displayedPosts.length) : 0,
    };
  }, [selectedUserId, users, totalPostsCount, displayedPosts, displayedTotalCount]);

  // Top active users for quick switch chips
  const topUsers = useMemo(() => {
    return users.slice(0, 8);
  }, [users]);

  // Export current list to CSV
  const handleExportCSV = () => {
    const headers = [
      'Post ID',
      'Title',
      'User ID',
      'User Name / Created By',
      'Categories',
      'Views',
      'Status',
      'Created At',
    ];

    const rows = displayedPosts.map((p) => [
      String(p.id),
      `"${(p.title || '').replace(/"/g, '""')}"`,
      String(p.user_id || selectedUserId || ''),
      `"${p.created_by || p.author || 'User #' + (p.user_id || selectedUserId)}"`,
      `"${(p.categories || []).map((c) => c.name).join('; ')}"`,
      String(p.view_count || 0),
      p.post_status === 1 ? 'Published' : 'Draft',
      `"${p.created_at || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `post_by_user_${selectedUserId}_${timeRange}.csv`
    );
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
          the required privileges to view post reports.
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
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadcrumb pageTitle="Post by User Report" />

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              fetchUserStats();
              fetchPosts(currentPage);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loadingPosts || loadingUsers ? 'animate-spin text-brand-600' : ''
                }`}
            />
            <span>Refresh</span>
          </button>

          {/* Time Range Selector */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            <Calendar className="ml-2 h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Time (সব সময়)</option>
              <option value="7d">Last 7 Days (গত ৭ দিন)</option>
              <option value="30d">Last 30 Days (গত ৩০ দিন)</option>
              <option value="90d">Last 90 Days (গত ৩ মাস)</option>
              <option value="365d">Last 1 Year (গত ১ বছর)</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={displayedPosts.length === 0}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Author / User Filter & Overview Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* User Info Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-md">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeStats.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeStats.role}
              </p>
            </div>
          </div>

          {/* User ID Dropdown Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-brand-600" />
              <span>Select by User ID:</span>
            </label>

            <select
              value={selectedUserId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full sm:w-80 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white cursor-pointer"
            >
              <option value="all">
                All Users (সকল ইউজার — মোট {activeStats.totalPosts.toLocaleString()} পোস্ট)
              </option>
              {users.map((u) => (
                <option key={u.user_id} value={String(u.user_id)}>
                  {u.user_name} (ID: {u.user_id}) {u.total_posts > 0 ? `— ${u.total_posts.toLocaleString()} পোস্ট` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>


        {/* Selected User Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-700 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Articles (মোট পোস্ট)
            </p>
            <p className="mt-1.5 text-2xl font-black text-gray-900 dark:text-white">
              {activeStats.totalPosts.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
              <span className="text-emerald-600 font-bold">
                ✓ {activeStats.published.toLocaleString()} প্রকাশিত
              </span>
              <span>•</span>
              <span className="text-amber-600 font-bold">
                ✎ {activeStats.drafts.toLocaleString()} ড্রাফট
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/50 p-4 dark:bg-blue-950/20">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Total Reads / Views (মোট ভিউ)
            </p>
            <p className="mt-1.5 text-2xl font-black text-blue-700 dark:text-blue-300">
              {activeStats.totalViews.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-blue-600/80 dark:text-blue-400">
              সব আর্টিকেলে প্রাপ্ত পাঠসংখ্যা
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Average Reads / Post (গড় ভিউ)
            </p>
            <p className="mt-1.5 text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {activeStats.avgViews.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-emerald-600/80 dark:text-emerald-400">
              প্রতি আর্টিকেলে গড় পাঠসংখ্যা
            </p>
          </div>

          <div className="rounded-xl bg-purple-50/50 p-4 dark:bg-purple-950/20">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              Active User ID
            </p>
            <p className="mt-1.5 text-2xl font-black text-purple-700 dark:text-purple-300">
              {selectedUserId === 'all' ? 'All' : `#${selectedUserId}`}
            </p>
            <p className="mt-2 text-[11px] text-purple-600/80 dark:text-purple-400">
              {selectedUserId === 'all'
                ? `ফিল্টার: সকল ইউজার`
                : `posts.user_id = ${selectedUserId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Table List by user_id */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800 overflow-hidden">
        {/* Table Controls Bar */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Articles List by {activeStats.name} ({displayedTotalCount.toLocaleString()})
            </h4>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>

            {/* Per Page */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 cursor-pointer"
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200 dark:bg-gray-700/50 dark:border-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-center w-16">
                  Post ID
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Article Title
                </th>
                <th scope="col" className="px-5 py-3.5">
                  User ID / Author
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Category
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Views
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Date
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingPosts ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-brand-600" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Loading posts from posts table...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : displayedPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-500">
                    <p className="font-semibold">কোনো আর্টিকেল পাওয়া যায়নি।</p>
                    <p className="text-xs text-gray-400 mt-1">
                      অন্য কোনো ইউজার, ফিল্টার বা সময়সীমা নির্বাচন করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                displayedPosts.map((post) => {
                  const postUserId = post.user_id;
                  const isPublished = post.post_status === 1;
                  const primaryCategory =
                    post.categories && post.categories.length > 0
                      ? post.categories[0].name
                      : 'General';

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-700/30"
                    >
                      {/* Post ID */}
                      <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-gray-500">
                        #{post.id}
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-md">
                        <Link
                          href={`/posts/edit/${post.id}`}
                          className="hover:text-brand-600 transition-colors line-clamp-2"
                          title={post.title}
                        >
                          {post.title}
                        </Link>
                      </td>

                      {/* User ID / Created By */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                            {post.created_by || post.author || `User #${postUserId || '?'}`}
                          </span>
                          {postUserId && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {postUserId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                          {primaryCategory}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                          <span>{(post.view_count || 0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                            <Clock className="h-3 w-3" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {post.created_at ? post.created_at.slice(0, 10) : '--'}
                          </span>
                          {post.created_at_ago && (
                            <span className="text-[10px] text-gray-400">
                              {post.created_at_ago}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/posts/edit/${post.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-600 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-brand-400"
                            title="Edit Post"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                          <a
                            href={`https://campustimes.press/posts/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 text-gray-400 hover:text-gray-700 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:hover:text-gray-200"
                            title="Open on live site"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
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

        {/* Table Footer with Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 p-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {displayedPosts.length > 0 ? (currentPage - 1) * perPage + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {Math.min(currentPage * perPage, displayedTotalCount)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {displayedTotalCount.toLocaleString()}
            </span>{' '}
            articles
          </p>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
