import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import CreatePost from "./component/CreatePost";

export const metadata: Metadata = {
  title: "New Posts | CT Admin",
  description: "New Posts Page CT Admin Dashboard",
};

export default function AllPosts() {
    
  return (
    <div>
      <PageBreadcrumb pageTitle="Create Post" />

      <div className="mt-6 rounded-2xl md:border border-gray-200 md:bg-white md:px-5 py-7 dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <CreatePost postId={null} />
      </div>

    </div>
  );
}
