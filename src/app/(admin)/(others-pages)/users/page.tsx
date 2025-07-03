import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import UserTable from "@/components/tables/UserTable";

export const metadata: Metadata = {
  title: "Manage Users | CT Admin",
  description: "All Users Page CT Admin Dashboard",
};

export default function AllUsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Users" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Manage Users
          </h3>
        </div>
          <UserTable />
      </div>
    </div> 
  );
}
