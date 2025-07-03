import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MenuBuilder from "@/components/menu/MenuBuilder";

import { Metadata } from "next";
import React from "react";



export const metadata: Metadata = {
  title: "Menus | CT Admin",
  description: "Menus Page CT Admin Dashboard",
};

export default function Menus() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Main Menu" />

        <MenuBuilder />
      
    </div>
  );
}