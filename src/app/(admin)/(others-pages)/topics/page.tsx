import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TagTable from "@/components/tables/TagTable";

import { Metadata } from "next";
import React from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

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