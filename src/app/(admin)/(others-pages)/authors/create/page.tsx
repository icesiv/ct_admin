import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import CreateAuthorForm from "@/components/form/CreateAuthor";

export const metadata: Metadata = {
    title: "New Author | CT Admin",
    description: "New Author Page CT Admin Dashboard",
};

export default function CreateAuthorPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="New Author" />

            <div className="mt-6 max-w-4xl mx-auto rounded-2xl md:border border-gray-200 md:bg-white md:px-5 py-7 dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <CreateAuthorForm />
            </div>

        </div>
    );
}
