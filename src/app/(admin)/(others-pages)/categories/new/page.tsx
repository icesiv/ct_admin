"use client";

import CategoryForm from "@/components/categories/CategoryForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function NewCategoryPage() {
    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Add New Category" />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Category</h1>
            </div>
            <CategoryForm />
        </div>
    );
}
