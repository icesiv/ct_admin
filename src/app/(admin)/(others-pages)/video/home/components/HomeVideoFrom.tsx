'use client';

import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/config/config";


export default function HomeVideoFrom() {
    const [videoId, setVideoId] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch current home video settings
    useEffect(() => {
        const fetchHomeVideo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/video/home_video', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    setVideoId(data.data.home_video_id || '');
                    setVideoTitle(data.data.home_video_title || '');
                } else {
                    setError(data.message || 'Failed to fetch home video settings');
                }
            } catch (err) {
                setError('Failed to connect to server');
                console.error('Error fetching home video:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeVideo();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const url = `${BASE_URL}admin/video/home_video`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    home_video_id: videoId,
                    home_video_title: videoTitle,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Home video settings updated successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.message || 'Failed to update home video settings');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error updating home video:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Extract YouTube video ID from various URL formats
    const extractYouTubeId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    // Get YouTube embed URL
    const getYoutubeEmbedUrl = () => {
        if (!videoId) return '';
        const cleanVideoId = extractYouTubeId(videoId);
        return `https://www.youtube.com/embed/${cleanVideoId}`;
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto py-6">
                <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
                        Home Video Settings
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                                    {success}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="videoId" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                                        YouTube Video ID or URL
                                    </label>
                                    <input
                                        type="text"
                                        id="videoId"
                                        value={videoId}
                                        onChange={(e) => setVideoId(e.target.value)}
                                        placeholder="Enter YouTube video ID or full URL"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Example: dQw4w9WgXcQ or https://youtube.com/watch?v=dQw4w9WgXcQ
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                                        Video Title
                                    </label>
                                    <input
                                        type="text"
                                        id="videoTitle"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        placeholder="Enter video title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Preview Section */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">
                        Video Preview
                    </h3>

                    {videoId ? (
                        <div className="space-y-4">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-700">
                                <iframe
                                    src={getYoutubeEmbedUrl()}
                                    title="YouTube video preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-4 py-2">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {videoTitle || 'No title set'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Video ID: {videoId}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                No video configured
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                Enter a YouTube video ID or URL above to see a preview.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}