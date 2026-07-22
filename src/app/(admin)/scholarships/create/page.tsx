import React from "react";
import CreateScholarship from "@/components/scholarships/CreateScholarship";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "New Scholarship | CT Admin",
  description: "New Scholarship Page CT Admin Dashboard",
};

export default function CreateScholarshipPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Create Scholarship" />
      <CreateScholarship />
    </div>
  );
}
