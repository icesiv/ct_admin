import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import CreatePost from "../../create/component/CreatePost";


export const metadata: Metadata = {
  title: "Edit Posts | CT Admin",
  description: "Edit Posts Page CT Admin Dashboard",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
    <div>
      <PageBreadcrumb pageTitle="Edit Post" />

      <div className="mt-6 rounded-2xl md:border border-gray-200 md:bg-white md:px-5 py-7 dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CreatePost postId={id}/>
      </div>

    </div>
  );
}