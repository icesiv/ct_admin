import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Videos | CT Admin",
  description: "All Videos Page CT Admin Dashboard",
};

export default function AllUsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Videos" />
      
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Manage Videos</h1>
        <p className="mt-4 text-gray-600">This page is under construction.</p>
        <p className="mt-2 text-gray-500">Please check back later.</p>
      </div>
    </div>
  );
}
