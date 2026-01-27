"use client";
import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PencilIcon, TrashIcon, UserPlus, X } from 'lucide-react';
import { BASE_URL } from "@/config/config";
import Input from "../form/input/InputField";
import { useAuth } from "@/context/AuthContext";

// Define Author type
export type Author = {
  id: number;
  name: string;
  profile_image?: string | null;
  short_bio?: string | null;
  social_links?: any; // JSON
  created_at: string;
};

export default function AuthorTable() {
  const { authFetch } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle top-level fields manually or via state setters directly
    // This is a bit mixed since I used individual states before. 
    // Let's stick to individual states for existing ones but use a handler for social links
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation (optional here as it mimics CreateAuthor)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('edit_profile_image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const url = `${(BASE_URL || "").replace(/\/$/, "")}/admin/authors`;
      const response = await authFetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAuthors(data.data || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const url = `${(BASE_URL || "").replace(/\/$/, "")}/admin/authors/${editingId}`;

      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('short_bio', shortBio);

      if (profileImage) {
        formData.append('profile_image', profileImage);
      }
      // Ensure method spoofing or backend support for PUT with FormData
      // Laravel usually needs _method: PUT for FormData updates because PHP doesn't parse multipart/form-data on PUT requests natively nicely.
      formData.append('_method', 'PUT');

      formData.append('social_links', JSON.stringify(socialLinks));


      const res = await authFetch(url, {
        method: 'POST', // Use POST with _method=PUT for file upload support in Laravel
        body: formData
      });

      if (res.ok) {
        fetchAuthors();
        closeModal();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const url = `${(BASE_URL || "").replace(/\/$/, "")}/admin/authors/${id}`;
      await authFetch(url, {
        method: 'DELETE',
      });
      fetchAuthors();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (author: Author) => {
    setName(author.name);
    // setProfileImage(author.profile_image || ""); // profileImage state is now File | null
    setProfileImage(null); // Reset file input
    setImagePreview(author.profile_image || null); // Existing image URL used as preview
    setShortBio(author.short_bio || "");

    // Parse social links if they exist
    if (author.social_links) {
      // If it comes as object or string (Author type says 'any' but backend sends JSON string sometimes if not casted array)
      let links = author.social_links;
      if (typeof links === 'string') {
        try { links = JSON.parse(links); } catch (e) { }
      }
      setSocialLinks({
        facebook: links?.facebook || '',
        twitter: links?.twitter || '',
        linkedin: links?.linkedin || '',
        instagram: links?.instagram || ''
      });
    } else {
      setSocialLinks({ facebook: '', twitter: '', linkedin: '', instagram: '' });
    }

    setEditingId(author.id);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  }

  const resetForm = () => {
    setName("");
    setProfileImage(null);
    setImagePreview(null);
    setShortBio("");
    setSocialLinks({ facebook: '', twitter: '', linkedin: '', instagram: '' });
    setEditingId(null);
  }

  // --- COLUMNS ---
  const columns: ColumnDef<Author>[] = [
    {
      accessorKey: "profile_image",
      header: "Image",
      cell: ({ row }) => (
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 dark:border-gray-700">
          {row.original.profile_image ? (
            <img src={row.original.profile_image} alt={row.original.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500">img</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium text-gray-800 dark:text-white/90">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "short_bio",
      header: "Bio",
      cell: ({ row }) => <span className="text-gray-500 truncate max-w-[200px] block" title={row.original.short_bio || ""}>{row.original.short_bio || "-"}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row.original)} className="text-gray-500 hover:text-blue-600">
            <PencilIcon size={18} />
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="text-gray-500 hover:text-red-600">
            <TrashIcon size={18} />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: authors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: 10
      }
    },
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] sm:px-2 sm:pb-2">

      {/* --- SIMPLE MODAL IMPLEMENTATION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-250 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-800 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Edit Author
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">

              {/* Profile Image - Mimic CreateAuthor */}
              <div className="flex flex-col items-center space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                    />
                    {/* Assuming we might want to allow removing (setting null) but for now just clear preview */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <span className="text-gray-400 text-xs">No Img</span>
                  </div>
                )}
                <input
                  type="file"
                  id="edit_profile_image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('edit_profile_image')?.click()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:bg-gray-800 dark:text-white/90 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Choose Image
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <Input defaultValue={name} onChange={(e) => setName(e.target.value)} placeholder="Author Name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backstory / Bio</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400"
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                ></textarea>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Links</label>
                <div className="space-y-3">
                  <Input
                    type="text"
                    name="facebook"
                    defaultValue={socialLinks.facebook}
                    onChange={handleSocialChange}
                    placeholder="Facebook URL"
                  />
                  <Input
                    type="text"
                    name="twitter"
                    defaultValue={socialLinks.twitter}
                    onChange={handleSocialChange}
                    placeholder="Twitter/X URL"
                  />
                  <Input
                    type="text"
                    name="instagram"
                    defaultValue={socialLinks.instagram}
                    onChange={handleSocialChange}
                    placeholder="Instagram URL"
                  />
                  <Input
                    type="text"
                    name="linkedin"
                    defaultValue={socialLinks.linkedin}
                    onChange={handleSocialChange}
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal}>Cancel</button>
              <button
                onClick={handleUpdate}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow><TableCell className="text-center py-4">Loading...</TableCell></TableRow>
            ) : authors.length === 0 ? (
              <TableRow><TableCell className="text-center py-4">No authors found.</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
