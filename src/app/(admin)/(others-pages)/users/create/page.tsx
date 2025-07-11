import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import CreateUserForm from "@/components/form/CreateUser";

export const metadata: Metadata = {
  title: "New Posts | CT Admin",
  description: "New Posts Page CT Admin Dashboard",
};

export default function CreateUser() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Create User" />

      <div className="mt-6 rounded-2xl md:border border-gray-200 md:bg-white md:px-5 py-7 dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <CreateUserForm />

      </div>

    </div>
  );
}
