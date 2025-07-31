import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HomeVideoFrom from "./components/HomeVideoFrom";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Manage Home Video | CT Admin",
  description: "Manage Home Video CT Admin Dashboard",
};

export default function HomeVideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Home Video" />
      
      <HomeVideoFrom />
    </div>
  );
}
