'use client';

import React, { useState, useEffect } from 'react';
import { AdvertisementInput, Advertisement } from '@/types/ads';
import { useAdPositions } from '@/hooks/useAdPositions';

interface AdFormProps {
    initialData?: Advertisement | null;
    onSubmit: (data: AdvertisementInput) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export default function AdForm({ initialData, onSubmit, onCancel, isLoading }: AdFormProps) {
    const { positions } = useAdPositions();

    const [formData, setFormData] = useState<AdvertisementInput>({
        name: '',
        position: initialData?.position || positions[0]?.key || 'ad-home-1',
        link_url: '',
        is_active: false,
        start_date: '',
        end_date: '',
        config: {
            type: 'image',
            layout: 'container',
            breakpoint: 'lg',
            defaultWidth: 'full',
            defaultHeight: 'auto',
            containerClass: ''
        }
    });

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [mobileFile, setMobileFile] = useState<File | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            let configObj: any = initialData.config;
            if (typeof configObj === 'string') {
                try {
                    configObj = JSON.parse(configObj);
                } catch (e) {
                    configObj = {};
                }
            } else if (!configObj) {
                configObj = {};
            }

            setFormData({
                name: initialData.name,
                position: initialData.position,
                link_url: initialData.link_url || '',
                is_active: initialData.is_active,
                start_date: initialData.start_date ? initialData.start_date.slice(0, 16) : '',
                end_date: initialData.end_date ? initialData.end_date.slice(0, 16) : '',
                config: {
                    type: configObj.type || 'image',
                    layout: configObj.layout || 'container',
                    breakpoint: configObj.breakpoint || 'lg',
                    defaultWidth: configObj.defaultWidth !== undefined && configObj.defaultWidth !== null && configObj.defaultWidth !== '' ? String(configObj.defaultWidth) : 'full',
                    defaultHeight: configObj.defaultHeight !== undefined && configObj.defaultHeight !== null && configObj.defaultHeight !== '' ? String(configObj.defaultHeight) : 'auto',
                    containerClass: configObj.containerClass || '',
                    srcDesktop: configObj.srcDesktop,
                    srcMobile: configObj.srcMobile,
                }
            });
            // Try config srcDesktop first, then fallback to DB base image_url
            setPreview(configObj.srcDesktop || initialData.image_url || null);
            setMobilePreview(configObj.srcMobile || null);
        } else if (positions.length > 0 && !formData.position) {
            setFormData(prev => ({ ...prev, position: positions[0].key }));
        }
    }, [initialData, positions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (e.target.type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                [name]: value
            }
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setMobileFile(selectedFile);
            setMobilePreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: AdvertisementInput = {
            ...formData,
            image: file || undefined,
            mobile_image: mobileFile || undefined,
        };
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold dark:text-white">
                {initialData ? 'Edit Advertisement' : 'Create Advertisement'}
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Internal Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 p-2 border" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 p-2 border"
                        >
                            {positions.map((pos) => (
                                <option key={pos.key} value={pos.key}>
                                    {pos.label} ({pos.key})
                                </option>
                            ))}
                            {/* Fallback for custom positions not yet registered in standard list */}
                            {formData.position && !positions.some(p => p.key === formData.position) && (
                                <option value={formData.position}>
                                    {formData.position} (Custom)
                                </option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link URL</label>
                        <input type="url" name="link_url" value={formData.link_url} onChange={handleChange} placeholder="https://example.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 p-2 border" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select name="type" value={formData.config?.type} onChange={handleConfigChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-800 dark:text-white">
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Layout</label>
                            <select name="layout" value={formData.config?.layout} onChange={handleConfigChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-800 dark:text-white">
                                <option value="container">Container</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desktop Ad Media (Required)</label>
                        <input type="file" accept="image/*,video/mp4" onChange={handleFileChange} required={!initialData} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-gray-700 dark:file:text-gray-300" />
                        {preview && (
                            <div className="mt-4">
                                {formData.config?.type === 'video' ? (
                                    <video src={preview} autoPlay loop muted playsInline className="h-20 w-auto object-cover rounded border border-gray-200" />
                                ) : (
                                    <img src={preview} alt="Desktop Preview" className="h-20 w-auto object-cover rounded border border-gray-200" />
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Ad Media (Optional)</label>
                        <input type="file" accept="image/*,video/mp4" onChange={handleMobileFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-gray-700 dark:file:text-gray-300" />
                        {mobilePreview && (
                            <div className="mt-4">
                                {formData.config?.type === 'video' ? (
                                    <video src={mobilePreview} autoPlay loop muted playsInline className="h-20 w-auto object-cover rounded border border-gray-200" />
                                ) : (
                                    <img src={mobilePreview} alt="Mobile Preview" className="h-20 w-auto object-cover rounded border border-gray-200" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3 p-4 mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-white">Breakpoint</label>
                        <input type="text" name="breakpoint" value={formData.config?.breakpoint || ''} onChange={handleConfigChange} placeholder="e.g. lg, sm" className="mt-1 block w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-white">Default Width</label>
                        <input
                            type="text"
                            name="defaultWidth"
                            value={formData.config?.defaultWidth || ''}
                            onChange={handleConfigChange}
                            placeholder="e.g. full, 728px, 300px"
                            className="mt-1 block w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {['full', '728px', '970px', '300px', '320px'].map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, defaultWidth: w }
                                    }))}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                                        formData.config?.defaultWidth === w
                                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-white">Default Height</label>
                        <input
                            type="text"
                            name="defaultHeight"
                            value={formData.config?.defaultHeight || ''}
                            onChange={handleConfigChange}
                            placeholder="e.g. auto, 90px, 250px"
                            className="mt-1 block w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {['auto', '90px', '250px', '152px', '100px'].map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, defaultHeight: h }
                                    }))}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                                        formData.config?.defaultHeight === h
                                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-white">Container Class</label>
                        <input type="text" name="containerClass" value={formData.config?.containerClass || ''} onChange={handleConfigChange} placeholder="e.g. bg-gray-100" className="mt-1 block w-full text-sm p-2 border rounded-md dark:bg-gray-800 dark:text-white" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                        <strong>Live Size:</strong> {formData.config?.defaultWidth || 'full'} × {formData.config?.defaultHeight || 'auto'}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Frontend render: {formData.config?.defaultWidth === 'full' ? '100% width' : (formData.config?.defaultWidth?.endsWith('px') ? formData.config.defaultWidth : `${formData.config?.defaultWidth || '100%'}px`)} × {formData.config?.defaultHeight === 'auto' ? 'auto height' : (formData.config?.defaultHeight?.endsWith('px') ? formData.config.defaultHeight : `${formData.config?.defaultHeight || 'auto'}px`)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                    <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Active Status</label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {isLoading ? 'Saving...' : (initialData ? 'Update Ad' : 'Create Ad')}
                </button>
            </div>
        </form>
    );
}
