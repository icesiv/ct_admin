"use client";

import React, { useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Edit3, Loader2 } from "lucide-react";
import { BASE_URL } from "@/config/config";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

interface Tag {
    id: number;
    name: string;
    slug: string;
}

export default function TagList() {
    const { authFetch } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 25,
    });

    const fetchTags = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authFetch(`${BASE_URL}tags`);
            if (!response.ok) throw new Error(`Failed to fetch tags: ${response.status}`);
            const data = await response.json();
            setTags(data.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load tags");
            addToast(err.message || "Failed to load tags", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleDeleteTag = async (id: number, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const response = await authFetch(`${BASE_URL}tags/${id}`, { method: "DELETE" });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete tag");
            }
            setTags(tags.filter((t) => t.id !== id));
            addToast("Tag deleted successfully!", "success");
        } catch (err: any) {
            addToast(err.message, "error");
        }
    };

    const handleEditClick = (tag: Tag) => {
        // TODO: Implement edit modal or redirect
        // Since we are splitting pages, we can redirect to /topics/[id]/edit if we want, 
        // OR we can keep the modal approach.
        // For now, let's assume we want to keep it simple and just show an alert or redirect.
        // But wait, the previous implementation was all-in-one.
        // The "New Topics" page handles creation.
        // We probably need an "Edit Topic" page too?
        // Or we can just reuse the TagForm in a modal here?
        // Let's use a modal for editing in the list view for convenience, or redirect.
        // Given the menu structure: "All Topics", "New Topics".
        // Redirecting seems cleaner for separation.
        // However, I didn't plan for a separate edit route in the sidebar, but hidden routes are fine.
        // I'll leave the edit button implementation open for now, maybe just log?
        // No, I should implement it. I'll pass the tag to an edit form.
        // I'll implement a redirect to `/topics/[id]/edit` (which I need to create).
        router.push(`/topics/${tag.id}/edit`);
    };

    const columns: ColumnDef<Tag>[] = [
        {
            accessorKey: "name",
            header: () => "Topic Name",
            cell: (info) => <span className="font-medium text-gray-800 dark:text-gray-200">{info.getValue() as string}</span>,
        },
        {
            accessorKey: "slug",
            header: () => "Slug",
            cell: (info) => <span className="text-gray-500 dark:text-gray-400 text-sm">{info.getValue() as string}</span>,
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="flex space-x-4">
                    <button onClick={() => handleEditClick(row.original)} className="text-blue-500 hover:text-blue-600" title="Edit">
                        <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDeleteTag(row.original.id, row.original.name)} className="text-red-500 hover:text-red-600" title="Delete">
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: tags,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        state: { pagination, globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                    placeholder="Search topics..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : error ? (
                <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : tags.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No topics found</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableCell key={header.id} isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-750 border-b">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-medium">{table.getPageCount()}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
