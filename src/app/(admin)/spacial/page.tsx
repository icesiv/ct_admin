"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Loader2, Save, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { SpacialService, SpacialData } from "@/services/SpacialService";
import Image from "next/image";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function SpacialPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<SpacialData>({});

    const [bannerDFile, setBannerDFile] = useState<File | null>(null);
    const [bannerMFile, setBannerMFile] = useState<File | null>(null);

    const [bannerDPreview, setBannerDPreview] = useState<string | null>(null);
    const [bannerMPreview, setBannerMPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await SpacialService.getSettings();
            if (data?.data) {
                setFormData(data.data);
                if (data.data.banner_d) setBannerDPreview(data.data.banner_d);
                if (data.data.banner_m) setBannerMPreview(data.data.banner_m);
            }
        } catch (error) {
            console.error("Failed to fetch spacial settings:", error);
            addToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'd' | 'm') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        if (type === 'd') {
            setBannerDFile(file);
            setBannerDPreview(previewUrl);
        } else {
            setBannerMFile(file);
            setBannerMPreview(previewUrl);
        }
    };

    const handleRemoveBanner = (e: React.MouseEvent, type: 'd' | 'm') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (type === 'd') {
            setBannerDFile(null);
            setBannerDPreview(null);
            setFormData(prev => ({ ...prev, banner_d: '' }));
        } else {
            setBannerMFile(null);
            setBannerMPreview(null);
            setFormData(prev => ({ ...prev, banner_m: '' }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let currentBannerD = formData.banner_d;
            let currentBannerM = formData.banner_m;

            // Upload banner D if new file selected
            if (bannerDFile) {
                const uploadRes = await SpacialService.uploadImage(bannerDFile);
                if (uploadRes.success) {
                    currentBannerD = uploadRes.data.file_url;
                } else {
                    throw new Error("Failed to upload desktop banner");
                }
            }

            // Upload banner M if new file selected
            if (bannerMFile) {
                const uploadRes = await SpacialService.uploadImage(bannerMFile);
                if (uploadRes.success) {
                    currentBannerM = uploadRes.data.file_url;
                } else {
                    throw new Error("Failed to upload mobile banner");
                }
            }

            const dataToSave = {
                ...formData,
                banner_d: currentBannerD,
                banner_m: currentBannerM,
            };

            const res = await SpacialService.updateSettings(dataToSave);
            if (!res.success) {
                throw new Error(res.message || "Failed to save settings");
            }

            setFormData(dataToSave); // Update with potential new URLs
            setBannerDFile(null);
            setBannerMFile(null);

            addToast("Settings saved successfully", "success");
        } catch (err: any) {
            console.error("Save error:", err);
            addToast(err.message || "Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Spacial Settings" />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Toggles */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 cursor-pointer" htmlFor="show_spacial_toggle">
                                Enable Special Section
                                <p className="text-xs text-gray-500 font-normal mt-0.5">Toggle visibility of the entire special block on the storefront.</p>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="show_spacial_toggle"
                                    className="sr-only peer"
                                    checked={formData.show_spacial !== undefined ? !!formData.show_spacial : true}
                                    onChange={(e) => setFormData(prev => ({ ...prev, show_spacial: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 cursor-pointer" htmlFor="show_news_toggle">
                                Show News Grid
                                <p className="text-xs text-gray-500 font-normal mt-0.5">Toggle visibility of the 5 associated news cards.</p>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="show_news_toggle"
                                    className="sr-only peer"
                                    checked={formData.show_news !== undefined ? !!formData.show_news : true}
                                    onChange={(e) => setFormData(prev => ({ ...prev, show_news: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-6"></div>

                    {/* General Settings */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Color (Hex)</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="theme_color"
                                    value={formData.theme_color || '#000000'}
                                    onChange={handleChange}
                                    className="h-10 w-14 rounded-md cursor-pointer border-0 p-1 bg-white dark:bg-gray-900"
                                />
                                <input
                                    type="text"
                                    name="theme_color"
                                    value={formData.theme_color || ''}
                                    onChange={handleChange}
                                    className="flex-1 w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-6"></div>

                    {/* Banners */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Desktop Banner</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600 relative overflow-hidden group h-40">
                                {bannerDPreview ? (
                                    <div className="absolute inset-0">
                                        <Image src={bannerDPreview} alt="Desktop Banner" layout="fill" objectFit="contain" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-white text-sm font-medium">Click to change</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveBanner(e, 'd')}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all z-20 shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
                                            title="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center self-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                            <span>Upload a file</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => handleFileChange(e, 'd')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Banner</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-600 relative overflow-hidden group h-40">
                                {bannerMPreview ? (
                                    <div className="absolute inset-0">
                                        <Image src={bannerMPreview} alt="Mobile Banner" layout="fill" objectFit="contain" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-white text-sm font-medium">Click to change</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleRemoveBanner(e, 'm')}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all z-20 shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
                                            title="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center self-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                            <span>Upload a file</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => handleFileChange(e, 'm')} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-6"></div>

                    {/* News IDs */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">News Selection</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">News {num} ID</label>
                                    <input
                                        type="number"
                                        name={`news_${num}_id`}
                                        value={(formData[`news_${num}_id` as keyof SpacialData] as string | number) || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ID"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-6"></div>

                    {/* More Type & Value */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">More Type</label>
                            <select
                                name="more_type"
                                value={(formData.more_type as string) || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select type...</option>
                                <option value="category">Category</option>
                                <option value="topic">Topic</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">More Value</label>
                            <input
                                type="text"
                                name="more_value"
                                value={(formData.more_value as string) || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. valid category or topic name/slug"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={saving} startIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
                            {saving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
