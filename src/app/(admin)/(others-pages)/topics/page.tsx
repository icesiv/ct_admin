import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TagTable from "@/components/tables/TagTable";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Topics | CT Admin",
  description: "Topics Page CT Admin Dashboard",
};

export default function Topics() {


  return (
    <div>
      <PageBreadcrumb pageTitle="Topics" />

      <TagTable />
    </div>
  );
}