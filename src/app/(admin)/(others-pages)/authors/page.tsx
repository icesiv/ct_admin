import { Metadata } from "next";

import React from "react";
import AuthorTable from "@/components/tables/AuthorTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
    title: "Authors | CT Admin",
    description: "Authors Page CT Admin Dashboard",
};

export default function AuthorPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Manage Author" />
            <AuthorTable />
        </div>
    );
}
