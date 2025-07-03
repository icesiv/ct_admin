import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import NewsListView from "@/components/lead-news/NewsListView";

export const metadata: Metadata = {
  title: "Manage Posts | CT Admin",
  description: "Manage Posts Page CT Admin Dashboard",
};

export default function AllPosts() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Posts" />
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full text-center">
          <NewsListView />
        </div>
      </div>

    </div>
  );
}
