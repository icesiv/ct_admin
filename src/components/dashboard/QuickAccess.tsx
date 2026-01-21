import React from "react";
import {
  Newspaper,
  Plus,
  Grid3X3,
  Tag,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export const QuickAccess = () => {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Quick Access
          </h3>
          {/* Button Grid - 2 columns on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 gap-6">

            {/* create post */}
            <button onClick={() => router.push('/posts/create')} className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span className="text-sm">Create Post</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>

            {/* All Posts */}
            <button onClick={() => router.push('/posts')} className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out">
              <Grid3X3 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="text-sm">All Post</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>

            {/* LeadNews */}
            <button onClick={() => router.push('/lead-news')} className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out">
              <Newspaper className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">LeadNews</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>

            {/* BreakingNews */}
            <button onClick={() => router.push('/breaking-news')} className="group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-out">
              <Tag className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">Breaking</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};