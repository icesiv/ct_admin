"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Video = {
  id: number;
  video_id: string;
  title: string;
  source: "youtube" | "facebook";
  cover_image?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
};

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const token = ""; // 🔑 Put your auth token handling logic here

  // Fetch videos
  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setVideos(json.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this video?")) return;
    await fetch(`/api/admin/videos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    loadVideos();
  }

  function handleEdit(video: Video) {
    setEditingVideo(video);
    setOpen(true);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Videos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingVideo(null);
              }}
            >
              + New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Create Video"}
              </DialogTitle>
            </DialogHeader>
            <VideoForm
              initialData={editingVideo}
              token={token}
              onSaved={() => {
                setOpen(false);
                loadVideos();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Video ID</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Source</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Order</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td className="p-2 border">{v.id}</td>
                <td className="p-2 border">{v.video_id}</td>
                <td className="p-2 border">{v.title}</td>
                <td className="p-2 border">{v.source}</td>
                <td className="p-2 border">{v.is_active ? "Yes" : "No"}</td>
                <td className="p-2 border">{v.display_order}</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(v)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-2"
                    onClick={() => handleDelete(v.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Video Form Component
function VideoForm({
  initialData,
  token,
  onSaved,
}: {
  initialData: Video | null;
  token: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Video>>(
    initialData || {
      video_id: "",
      title: "",
      source: "youtube",
      cover_image: "",
      description: "",
      display_order: 0,
      is_active: true,
    }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `/api/admin/videos/${initialData.id}`
      : `/api/admin/videos`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (json.success) {
      onSaved();
    } else {
      alert(json.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Video ID"
        value={form.video_id || ""}
        onChange={(e) => setForm({ ...form, video_id: e.target.value })}
      />
      <Input
        placeholder="Title"
        value={form.title || ""}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Input
        placeholder="Cover Image URL"
        value={form.cover_image || ""}
        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={form.description || ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Display Order"
        value={form.display_order ?? 0}
        onChange={(e) =>
          setForm({ ...form, display_order: parseInt(e.target.value) })
        }
      />
      <select
        className="border rounded p-2 w-full"
        value={form.source}
        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
      >
        <option value="youtube">YouTube</option>
        <option value="facebook">Facebook</option>
      </select>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        <span>Active</span>
      </label>
      <Button type="submit" className="w-full">
        {initialData ? "Update Video" : "Create Video"}
      </Button>
    </form>
  );
}
