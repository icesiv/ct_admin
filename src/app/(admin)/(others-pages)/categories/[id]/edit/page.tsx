"use client";

import CategoryForm from "@/components/categories/CategoryForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/config/config";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
    const params = useParams();
    const { authFetch } = useAuth();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                // Fetch all categories to find the specific one, as there might not be a direct show endpoint or to reuse existing data structure
                // Assuming we might need to fetch the specific category or filter from list. 
                // Let's try to fetch all and filter first as per typical implementation in this project or use a show endpoint if available.
                // However, based on potential API structure, usually `GET /admin/categories/{id}` or `GET /categories/{id}` exists.
                // Since I don't have the full API doc, I'll assume standard REST or fallback to list filtering.
                // Given `CategoriesManager` uses `GET /admin/categories`, I'll use that and filter for robustness if specific endpoint fails or just use it if I can.
                // Wait, `authFetch` to `${BASE_URL}admin/categories` returns list.
                // Let's try to find the category from the list for now to be safe, or if there's a specific endpoint.

                // Better approach: specific endpoint if possible, but let's check `CategoriesManager` again. 
                // It fetches all categories. 
                // I will try to fetch the specific category. If it fails, I might need to fetch all. 
                // Let's assume `GET /admin/categories/{id}` exists or similar.
                // Actually `CategoriesAdmin` in `CategoryController` returns all. 
                // `CategoryCRUD` uses `news_categories` from context which might be better?
                // But `news_categories` in context seems to be for the menu.
                // Let's fetch all and filter for now to be sure we get the data, as the controller `CategoriesAdmin` returns all.

                const response = await authFetch(`${BASE_URL}admin/categories`);
                if (response.ok) {
                    const data = await response.json();
                    const found = data.data.find((c: any) => c.id === Number(params.id));
                    if (found) {
                        setCategory(found);
                    }
                }
            } catch (error) {
                console.error("Error fetching category:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchCategory();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!category) {
        return <div>Category not found</div>;
    }

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Edit Category" />
            <CategoryForm initialData={category} />
        </div>
    );
}
