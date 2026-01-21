import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Newspaper,
} from 'lucide-react';
import { BASE_URL } from "@/config/config";

interface DashboardStats {
  views_24h: number;
  views_trend: number;
  articles_24h: number;
  articles_trend: number;
}

export const NewsMetrics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
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
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Eye className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Views (24h)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats?.views_24h.toLocaleString() || 0}
            </h4>
          </div>
          <Badge color={viewsTrendIsPositive ? "success" : "error"}>
            {viewsTrendIsPositive ? <ArrowUp /> : <ArrowDown />}
            {Math.abs(stats?.views_trend || 0)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Newspaper className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              New Articles (24h)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats?.articles_24h.toLocaleString() || 0}
            </h4>
          </div>

          <Badge color={articlesTrendIsPositive ? "success" : "error"}>
            {articlesTrendIsPositive ? <ArrowUp /> : <ArrowDown />}
            {Math.abs(stats?.articles_trend || 0)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
