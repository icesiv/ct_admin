"use client";
import React, { useEffect, useState } from 'react';

import { LocationService } from '@/services/LocationService';
import { Division, District, Post } from '@/types/location';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const DistrictNewsPage = () => {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchDivisions();
    }, []);

    useEffect(() => {
        if (selectedDivision) {
            fetchDistricts(selectedDivision);
            setSelectedDistrict(null); // Reset district when division changes
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedDivision]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchPosts(selectedDistrict);
        } else {
            setPosts([]);
        }
    }, [selectedDistrict]);

    const fetchDivisions = async () => {
        try {
            setError(null);
            console.log('Fetching divisions...');
            const data = await LocationService.getDivisions();
            console.log('Divisions received:', data);
            setDivisions(data);

            if (!data || data.length === 0) {
                setError('No divisions found in the database');
            }
        } catch (error: any) {
            console.error("Failed to fetch divisions", error);
            setError(error?.response?.data?.message || error?.message || 'Failed to fetch divisions');
        }
    };

    const fetchDistricts = async (divisionId: number) => {
        try {
            const data = await LocationService.getDistricts(divisionId);
            setDistricts(data);
        } catch (error) {
            console.error("Failed to fetch districts", error);
        }
    };

    const fetchPosts = async (districtId: number) => {
        setLoading(true);
        try {
            const data = await LocationService.getPostsByDistrict(districtId, page);
            setPosts(data.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                        Select Division
                    </label>
                    <select
                        value={selectedDivision || ''}
                        onChange={(e) => setSelectedDivision(Number(e.target.value))}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                        <option value="">Select a division</option>
                        {divisions.map((div) => (
                            <option key={div.id} value={div.id}>
                                {div.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2.5 block text-black dark:text-white">
                        Select District
                    </label>
                    <select
                        value={selectedDistrict || ''}
                        onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                        disabled={!selectedDivision}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                        <option value="">Select a district</option>
                        {districts.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                                {dist.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10">
                    <Loader2 className="animate-spin w-10 h-10 text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} className="flex gap-4 border-b border-stroke dark:border-strokedark py-4 last:border-b-0">
                                <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
                                    {post.featured_image ? (
                                        <Image
                                            src={`${post.featured_image}`}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between">
                                    <h3 className="font-semibold text-black dark:text-white hover:text-primary transition-colors">
                                        <a href={`/posts/view/${post.id}`} target="_blank" rel="noopener noreferrer">{post.title}</a>
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        {post.categories && post.categories.length > 0 && (
                                            <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                                {post.categories[0].name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : selectedDistrict && (
                        <p className="text-center text-gray-500 py-10">No news found for this district.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DistrictNewsPage;
