import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import CreatePost from "../../create/component/CreatePost";


export const metadata: Metadata = {
  title: "Edit Posts | CT Admin",
  description: "Edit Posts Page CT Admin Dashboard",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Post" />
      <CreatePost postId={id} />
    </div>
  );
}