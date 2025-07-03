import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryCRUD from "@/components/menu/CategoriesManager";

import { Metadata } from "next";
import React from "react";



export const metadata: Metadata = {
  title: "Categories | CT Admin",
  description: "Categories Page CT Admin Dashboard",
};

export default function Categories() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Category Manager" />

        <CategoryCRUD />
      
    </div>
  );
}