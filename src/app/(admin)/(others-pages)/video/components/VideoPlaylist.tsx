'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BASE_URL } from '@/config/config';
import { Trash2, GripVertical, Star } from 'lucide-react';
import { useToast } from "@/components/ToastProvider";
import { Identifier } from 'dnd-core';
import { useAuth } from "@/context/AuthContext";

interface Video {
    id: number;
    video_id: string;
    title: string;
    source: 'youtube' | 'facebook';
    is_featured: boolean;
    display_order: number;
}

interface DragItem {
    index: number;
    id: string;
    type: string;
}

const VideoItem = ({ video, index, moveVideo, deleteVideo, toggleFeatured }: any) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: 'card',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            moveVideo(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'card',
        item: () => {
            return { id: video.id, index };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity }} data-handler-id={handlerId} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-2 dark:bg-gray-800 dark:border-gray-700">
            <div className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
            </div>

            <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback for non-youtube/error
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate dark:text-white">{video.title}</h4>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">{video.video_id}</p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => toggleFeatured(video.id)}
                    className={`p-2 rounded-full transition-colors ${video.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title="Toggle Featured"
                >
                    <Star size={20} fill={video.is_featured ? "currentColor" : "none"} />
                </button>
                <button
                    type="button"
                    onClick={() => deleteVideo(video.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20"
                    title="Delete Video"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};


export default function VideoPlaylist() {
    const { addToast } = useToast();
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { authFetch } = useAuth();

    // New Video Form State
    const [newVideoId, setNewVideoId] = useState('');
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch videos
    const fetchVideos = async () => {
        try {
            setIsLoading(true);
            setIsLoading(true);
            const response = await authFetch(`${BASE_URL}admin/videos`, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                // Ensure sorted by display_order
                const sorted = data.data.sort((a: Video, b: Video) => a.display_order - b.display_order);
                setVideos(sorted);
            } else {
                addToast('Failed to fetch videos', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('Error loading videos', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // Drag and Drop ordering
    const moveVideo = useCallback((dragIndex: number, hoverIndex: number) => {
        setVideos((prevVideos) => {
            const newVideos = [...prevVideos];
            const draggedVideo = newVideos[dragIndex];
            newVideos.splice(dragIndex, 1);
            newVideos.splice(hoverIndex, 0, draggedVideo);
            return newVideos;
        });
    }, []);

    // Add Video
    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVideoId || !newVideoTitle) return;

        setIsAdding(true);
        try {
            const response = await authFetch(`${BASE_URL}admin/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    video_id: newVideoId,
                    title: newVideoTitle,
                    source: 'youtube', // Defaulting to youtube for now as per requirement context
                    is_active: true,
                    display_order: 0, // Prepend to start (effectively)
                }),
            });

            const data = await response.json();

            if (data.success) {
                setVideos([data.data, ...videos]);
                setNewVideoId('');
                setNewVideoTitle('');
                addToast('Video added successfully', 'success');
            } else {
                addToast(data.message || 'Failed to add video', 'error');
            }
        } catch (error) {
            addToast('Error adding video', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    // Helper to extract ID from URL
    const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Simple regex for ID extraction if URL is pasted
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = val.match(regExp);
        if (match && match[2].length === 11) {
            setNewVideoId(match[2]);
        } else {
            setNewVideoId(val);
        }
    };

    // Delete Video
    const handleDeleteVideo = async (id: number) => {
        if (!confirm('Are you sure you want to remove this video?')) return;

        try {
            const response = await authFetch(`${BASE_URL}admin/videos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();

            if (data.success) {
                setVideos(videos.filter(v => v.id !== id));
                addToast('Video removed', 'success');
            } else {
                addToast('Failed to remove video', 'error');
            }
        } catch (error) {
            addToast('Error removing video', 'error');
        }
    };

    // Toggle Featured
    const toggleFeatured = (id: number) => {
        setVideos(videos.map(v => ({
            ...v,
            is_featured: v.id === id ? true : false // Single select enforcement in UI
        })));
    };

    // Save Playlist Order & Status
    const savePlaylist = async () => {
        setIsSaving(true);
        try {
            const payload = videos.map((v, index) => ({
                id: v.id,
                display_order: index,
                is_featured: v.is_featured
            }));

            const response = await authFetch(`${BASE_URL}admin/videos/playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ videos: payload }),
            });

            const data = await response.json();
            if (data.success) {
                addToast('Playlist saved successfully!', 'success');
            } else {
                addToast('Failed to save playlist', 'error');
            }

        } catch (error) {
            addToast('Error connecting to server', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="max-w-4xl mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Video Playlist</h2>
                    <button
                        onClick={savePlaylist}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Playlist'}
                    </button>
                </div>

                {/* Add Video Form */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 dark:text-white">Add New Video</h3>
                    <form onSubmit={handleAddVideo} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="YouTube ID or URL"
                                value={newVideoId}
                                onChange={handleVideoIdChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Video Title"
                                value={newVideoTitle}
                                onChange={(e) => setNewVideoTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap dark:bg-gray-600 dark:hover:bg-gray-500"
                        >
                            {isAdding ? 'Adding...' : 'Add Video'}
                        </button>
                    </form>
                </div>

                {/* Playlist */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading videos...</div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800/50 dark:border-gray-700">
                            <p className="text-gray-500">No videos in playlist yet.</p>
                        </div>
                    ) : (
                        videos.map((video, index) => (
                            <VideoItem
                                key={video.id}
                                index={index}
                                video={video}
                                moveVideo={moveVideo}
                                deleteVideo={handleDeleteVideo}
                                toggleFeatured={toggleFeatured}
                            />
                        ))
                    )}
                </div>
            </div>
        </DndProvider>
    );
}
