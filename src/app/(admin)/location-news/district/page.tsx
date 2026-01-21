"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { LocationService } from '@/services/LocationService';
import { Division, District, Post } from '@/types/location';
import Image from 'next/image';
import { Loader2, Edit, Filter } from 'lucide-react';

const DistrictNewsPage = () => {
    const router = useRouter();
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
            if (data.data) {
                setPosts(data.data);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (postId: number) => {
        router.push(`/posts/edit/${postId}`);
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
                <>
                    {posts.length > 0 ? (
                        <div className="mt-6 mb-8">
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left min-w-[200px] text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 hidden md:block py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                District
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                By
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {posts.map((post) => (
                                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                                <td className="px-6 text-sm text-gray-900 dark:text-gray-100">
                                                    {post.id}
                                                </td>
                                                <td className="px-6 py-2 text-left text-sm text-gray-900 dark:text-amber-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
                                                            {post.featured_image ? (
                                                                <Image
                                                                    src={`${post.featured_image}`}
                                                                    alt={post.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">No Img</div>
                                                            )}
                                                        </div>
                                                        <span>{post.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 hidden md:block py-2 text-left whitespace-nowrap text-sm text-gray-500">
                                                    {post.districts && post.districts.length > 0 ? (
                                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                                            {post.districts[0].name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-2 text-left whitespace-nowrap text-sm text-gray-500">
                                                    {post.user?.name || 'Unknown'}<br />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(post.id)}
                                                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 mr-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
                                                        title="Edit Post"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : selectedDistrict && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Filter className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
                            <p className="text-gray-600">No news found for this district.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DistrictNewsPage;
