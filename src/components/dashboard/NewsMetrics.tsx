import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Newspaper,
} from 'lucide-react';
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";

interface DashboardStats {
  views_24h: number;
  views_trend: number;
  articles_24h: number;
  articles_trend: number;
}

export const NewsMetrics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authFetch(`${BASE_URL}admin/dashboard/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-800 h-32"></div>
        ))}
      </div>
    );
  }

  const viewsTrendIsPositive = (stats?.views_trend || 0) >= 0;
  const articlesTrendIsPositive = (stats?.articles_trend || 0) >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Metric Item */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <Eye className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">24 Hours</span>
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Views</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
            {stats?.views_24h.toLocaleString() || 0}
          </h4>
        </div>
        {/* Decorative background gradient */}
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-indigo-500/10" />
      </div>

      {/* Metric Item */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-rose-200 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            <Newspaper className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">24 Hours</span>
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">New Articles</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
            {stats?.articles_24h.toLocaleString() || 0}
          </h4>
        </div>
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-rose-500/10" />
      </div>
    </div>
  );
};
