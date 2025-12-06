"use client";

import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
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

import { Plus, Trash2, Edit3 } from "lucide-react";
import { BASE_URL } from "@/config/config";

import { useToast } from "@/components/ToastProvider";

// Tag interface
interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function TagManager() {
  const { addToast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25, // default page size
  });

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}tags`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`);
      }

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

  // Add a new tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setIsAdding(true);
      const response = await fetch(`${BASE_URL}tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add tag");
      }

      const result = await response.json();
      setTags([result.data, ...tags]);
      setNewTagName("");
      addToast("Tag added successfully!", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a tag
  const handleDeleteTag = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`${BASE_URL}tags/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

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

  // Table columns
  const columns: ColumnDef<Tag>[] = [
    {
      accessorKey: "name",
      header: () => "Tag Name",
      cell: (info) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: () => "Slug",
      cell: (info) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }) => {
        const tag = row.original;
        return (
          <div className="flex space-x-4">
            {/* <button className="text-blue-500 hover:text-blue-600" title="Edit">
              <Edit3 size={18} />
            </button> */}
            <button
              onClick={() => handleDeleteTag(tag.id, tag.name)}
              className="text-red-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  // Setup TanStack Table
  const table = useReactTable({
    data: tags,
    columns: columns, // your column definitions
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25, // 👈 Default to 25 items per page
      },
    },
  });


  return (
    <div className="space-y-6">
      {/* Add Tag Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Tag</h2>
        <form onSubmit={handleAddTag} className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isAdding}
            required
            minLength={1}
            maxLength={255}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={isAdding || !newTagName.trim()}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Tag
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tags DataTable */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            placeholder="Search tags..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 text-sm">{error}</div>
        ) : tags.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No tags found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        isHeader
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-750 border-b"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
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

          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
