"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BASE_URL } from "@/config/config";
import {
    Images,
    Trash2,
    Eye,
    EyeOff,
    ImagePlus,
    MoreVertical,
    Calendar
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface Album {
    id: number;
    title: string;
    is_active: boolean;
    photos_count: number;
    created_at: string;
}

export default function ManageGalleryPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const { authFetch } = useAuth();

    const fetchAlbums = async () => {
        try {
            const res = await authFetch(`${BASE_URL}admin/gallery/albums`);
            if (res.ok) {
                const data = await res.json();
                setAlbums(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load albums");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will delete all photos in this album.")) return;

        try {
            const res = await authFetch(`${BASE_URL}admin/gallery/albums/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Album deleted");
                setAlbums(albums.filter(a => a.id !== id));
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Failed to delete album");
        }
    };

    const ActivateAlbum = async (id: number) => {
        try {
            const res = await authFetch(`${BASE_URL}admin/gallery/albums/${id}/activate`, {
                method: "POST",
            });

            if (res.ok) {
                toast.success("Home Gallery Updated!");
                // Update local state to reflect change (only one active)
                const updated = await res.json(); // The activated album
                setAlbums(albums.map(a => ({
                    ...a,
                    is_active: a.id === id
                })));
            }
        } catch (err) {
            toast.error("Failed to update active gallery");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading galleries...</div>;

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Images className="text-indigo-600" />
                        Gallery Manager
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Manage your photo albums. One active album is shown on the homepage.
                    </p>
                </div>
                <Link
                    href="/gallery/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                >
                    <ImagePlus size={18} />
                    Create New Album
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                    <div key={album.id} className={`group relative bg-white dark:bg-gray-800 rounded-2xl border shadow-sm transition-all hover:shadow-md ${album.is_active ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 dark:border-gray-700'}`}>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            {album.is_active && (
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                                    Active on Home
                                </span>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1" title={album.title}>
                                        {album.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <Calendar size={12} />
                                        {new Date(album.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {album.photos_count} Photos
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/gallery/${album.id}`}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Manage Photos"
                                    >
                                        <ImagePlus size={18} />
                                    </Link>

                                    {!album.is_active && (
                                        <button
                                            onClick={() => ActivateAlbum(album.id)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Set as Active"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(album.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {albums.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Images className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">No albums created yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
