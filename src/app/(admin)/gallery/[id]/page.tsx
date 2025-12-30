"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BASE_URL } from "@/config/config";
import {
    ArrowLeft,
    Trash2,
    Plus,
    Save,
    Image as ImageIcon
} from "lucide-react";

interface Photo {
    id: number;
    image_url: string;
    caption: string;
    order: number;
}

interface Album {
    id: number;
    title: string;
    photos: Photo[];
}

export default function AlbumPhotosPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);

    // New Photo Form State
    const [newPhotoUrl, setNewPhotoUrl] = useState("");
    const [newPhotoCaption, setNewPhotoCaption] = useState("");
    const [adding, setAdding] = useState(false);

    // Unwrap params using React.use()
    const { id } = use(params);

    useEffect(() => {
        fetchAlbum();
    }, [id]);

    const fetchAlbum = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            // Robust Base URL handling
            const startUrl = BASE_URL || "";
            const baseUrl = startUrl.endsWith('/') ? startUrl : `${startUrl}/`;

            console.log("Fetching album from:", `${baseUrl}admin/gallery/albums/${id}`);

            const res = await fetch(`${baseUrl}admin/gallery/albums/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAlbum(data);
            } else {
                toast.error("Album not found");
                router.push('/gallery/manage');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (files: FileList) => {
        console.log("Starting upload...", files);
        setAdding(true);
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files[]', file);
        });

        try {
            const token = localStorage.getItem("auth_token");
            const startUrl = BASE_URL || "";
            const baseUrl = startUrl.endsWith('/') ? startUrl : `${startUrl}/`;
            const uploadUrl = `${baseUrl}admin/gallery/albums/${id}/upload`;

            console.log(`Uploading to: ${uploadUrl}`);

            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // Content-Type header excluded to let browser set boundary
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Uploaded ${data.photos.length} photos`);
                fetchAlbum();
            } else {
                console.error("Upload response not OK", res.status, res.statusText);
                throw new Error("Upload failed with status: " + res.status);
            }
        } catch (err) {
            toast.error("Upload failed");
            console.error("Upload caught error:", err);
        } finally {
            setAdding(false);
        }
    };

    const handleAddPhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            const token = localStorage.getItem("auth_token");
            const startUrl = BASE_URL || "";
            const baseUrl = startUrl.endsWith('/') ? startUrl : `${startUrl}/`;

            const res = await fetch(`${baseUrl}admin/gallery/photos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    album_id: id,
                    image_url: newPhotoUrl,
                    caption: newPhotoCaption,
                    order: (album?.photos.length || 0) + 1
                })
            });

            if (res.ok) {
                toast.success("Photo added");
                setNewPhotoUrl("");
                setNewPhotoCaption("");
                fetchAlbum(); // Refresh list
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Failed to add photo");
        } finally {
            setAdding(false);
        }
    };

    const handleDeletePhoto = async (photoId: number) => {
        if (!confirm("Delete this photo?")) return;

        try {
            const token = localStorage.getItem("auth_token");
            const baseUrl = BASE_URL!.endsWith('/') ? BASE_URL! : `${BASE_URL!}/`;
            const res = await fetch(`${baseUrl}admin/gallery/photos/${photoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Photo deleted");
                if (album) {
                    setAlbum({
                        ...album,
                        photos: album.photos.filter(p => p.id !== photoId)
                    });
                }
            }
        } catch (err) {
            toast.error("Failed");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!album) return null;

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{album.title}</h1>
                    <p className="text-sm text-gray-500">Manage photos in this album</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600" /> Add Photos
                </h2>

                {/* Drag & Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${adding ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            await handleFileUpload(e.dataTransfer.files);
                        }
                    }}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="gallery-upload"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                handleFileUpload(e.target.files);
                                e.target.value = ""; // Reset input to allow selecting same files again
                            }
                        }}
                    />
                    <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Drag photos here or <span className="text-indigo-600">click to browse</span>
                        </span>
                        <span className="text-xs text-gray-500">Supports JPG, PNG, WEBP</span>
                    </label>
                    {adding && <p className="mt-2 text-sm text-indigo-600 font-medium animate-pulse">Uploading...</p>}
                </div>

                {/* Manual URL Input (Legacy) */}
                <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-indigo-600">Add by URL instead</summary>
                    <form onSubmit={handleAddPhoto} className="flex gap-2 items-end mt-2">
                        <input
                            type="url"
                            required
                            value={newPhotoUrl}
                            onChange={e => setNewPhotoUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none"
                        />
                        <button type="submit" disabled={adding} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Add</button>
                    </form>
                </details>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.photos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Image */}
                        <img
                            src={photo.image_url}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay for actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                title="Delete Photo"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Caption Banner */}
                        {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                                <p className="text-white text-xs truncate text-center">{photo.caption}</p>
                            </div>
                        )}
                    </div>
                ))}

                {album.photos.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        Album is empty. Add some photos above!
                    </div>
                )}
            </div>
        </div>
    );
}
