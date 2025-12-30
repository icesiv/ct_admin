'use client';

import React, { useState } from 'react';
import { useAds } from '@/hooks/useAds';
import { Advertisement, AdvertisementInput } from '@/types/ads';
import AdForm from './AdForm';
import { Modal } from '@/components/ui/modal';
import { Pencil, Trash2, Plus, BarChart2 } from 'lucide-react';

export default function AdsManager() {
    const { ads, isLoading, isError, createAd, updateAd, deleteAd } = useAds();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = () => {
        setEditingAd(null);
        setIsModalOpen(true);
    };

    const handleEdit = (ad: Advertisement) => {
        setEditingAd(ad);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this ad?')) {
            await deleteAd(id);
        }
    };

    const handleSubmit = async (data: AdvertisementInput) => {
        setIsSubmitting(true);
        try {
            if (editingAd) {
                await updateAd({ id: editingAd.id, data });
            } else {
                await createAd(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to save advertisement');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading ads...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading ads</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Ad Management</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    <span>New Ad</span>
                </button>
            </div>

            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Preview</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Name / Position</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Status</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Stats</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {ads.map((ad) => (
                            <tr key={ad.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-16 w-24 flex-shrink-0">
                                            <img className="h-16 w-24 object-cover rounded-md" src={ad.image_url} alt={ad.name} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ad.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{ad.position}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ad.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {ad.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col">
                                        <span className="flex items-center gap-1"><BarChart2 size={12} />{ad.impressions} Impr.</span>
                                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">🖱 {ad.clicks} Clicks</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(ad)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {ads.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No advertisements found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
                <AdForm
                    initialData={editingAd}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
}
