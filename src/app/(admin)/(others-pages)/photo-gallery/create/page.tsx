import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Gallery | CT Admin",
  description: "Create Gallery Posts Page CT Admin Dashboard",
};

export default function AllPosts() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Gallery" />

      <div className="mt-6 rounded-2xl md:border border-gray-200 md:bg-white md:px-5 py-7 dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
   
      </div>

    </div>
  );
}