import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import NewsListView from "@/components/lead-news/NewsListView";
import CreatePost from "@/components/news/CreatePost";

export const metadata: Metadata = {
  title: "New Posts | CT Admin",
  description: "New Posts Page CT Admin Dashboard",
};

export default function AllPosts() {
  interface SmallButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }

  const SmallButton = ({ text, onClick, disabled = false, className = "" }: SmallButtonProps) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`h-11 flex items-center justify-center border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm transition rounded-lg shadow-theme-xs hover:bg-brand-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {text}
      </button>
    )
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Post" />

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <CreatePost />
      </div>

    </div>
  );
}
