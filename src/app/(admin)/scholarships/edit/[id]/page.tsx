import React from "react";
import EditScholarship from "@/components/scholarships/EditScholarship";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Edit Scholarship | CT Admin",
  description: "Edit Scholarship Page CT Admin Dashboard",
};

export default function EditScholarshipPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Scholarship" />
      <EditScholarship />
    </div>
  );
}
