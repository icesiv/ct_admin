import { Metadata } from "next";
import React from "react";
import CreatePost from "./component/CreatePost";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "New Posts | CT Admin",
  description: "New Posts Page CT Admin Dashboard",
};

export default function AllPosts() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Post" />
      <CreatePost postId={null} />
    </div>
  );
}
