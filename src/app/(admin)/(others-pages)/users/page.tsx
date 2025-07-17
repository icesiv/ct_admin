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
      <UserTable />
    </div>
  );
}
