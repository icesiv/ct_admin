'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, ChevronDown, Search, Check, Globe } from 'lucide-react';
import { ScholarshipInput, Scholarship } from '@/types/scholarships';
import { FeatureImageUploader } from '@/components/editor/FeatureUploader';
import ImageUploaderModal, { ImageData } from '@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal';
import WysiwygEditor from '@/components/editor/WysiwygEditor';
import { WysiwygEditorRef } from '@/components/editor';
import DatePicker from '@/components/form/date-picker';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/config/config';

const POPULAR_COUNTRIES = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'Japan',
    'China',
    'France',
    'Italy',
    'South Korea',
    'Sweden',
    'Netherlands',
    'Switzerland',
    'Turkey',
    'Malaysia',
    'Singapore',
    'New Zealand',
    'Norway',
    'Finland',
    'Denmark',
    'Austria',
    'Belgium',
    'Spain',
    'Portugal',
    'Ireland',
    'Saudi Arabia',
    'United Arab Emirates',
    'Qatar',
    'Hungary',
    'Poland',
    'Russia',
    'Taiwan',
    'Thailand',
    'Hong Kong',
    'Bangladesh',
    'India',
    'Pakistan',
    'Egypt',
    'Indonesia',
    'Vietnam',
    'Brazil',
    'Mexico',
    'South Africa',
];

interface SearchableCountrySelectProps {
    value: string;
    onChange: (country: string) => void;
    placeholder?: string;
}

function SearchableCountrySelect({ value, onChange, placeholder = 'Select country...' }: SearchableCountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = POPULAR_COUNTRIES.filter(c =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    const isCustomValue = search.trim() !== '' && !POPULAR_COUNTRIES.some(c => c.toLowerCase() === search.trim().toLowerCase());

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-left text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={value ? 'text-gray-900 dark:text-white font-medium truncate' : 'text-gray-400 truncate'}>
                        {value || placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {value && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Clear country"
                        >
                            <X size={14} />
                        </span>
                    )}
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                        {filteredCountries.map((country) => (
                            <button
                                key={country}
                                type="button"
                                onClick={() => {
                                    onChange(country);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={`w-full text-left px-3 py-1.5 text-sm rounded transition-colors flex items-center justify-between ${
                                    value === country
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-medium'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span>{country}</span>
                                {value === country && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                            </button>
                        ))}

                        {isCustomValue && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(search.trim());
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className="w-full text-left px-3 py-2 text-sm rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5"
                            >
                                <span>Use custom: "{search.trim()}"</span>
                            </button>
                        )}

                        {filteredCountries.length === 0 && !isCustomValue && (
                            <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                                No matching countries found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface ScholarshipFormProps {
    initialData?: Scholarship | null;
    onSubmit: (data: ScholarshipInput) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ScholarshipForm({ initialData, onSubmit, onCancel, isLoading }: ScholarshipFormProps) {
    const [formData, setFormData] = useState<ScholarshipInput>({
        title: '',
        description: '',
        feature_image: null,
        published_date: '',
        application_deadline: '',
        country: '',
        degree_level: '',
        funding_type: '',
        ielts_required: '',
        last_verified_date: '',
        source: '',
        reference_post_id: null,
    });

    const { authFetch } = useAuth();
    const [isFeature, setIsFeature] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const editorRef = useRef<WysiwygEditorRef>(null);

    const [verifyingPost, setVerifyingPost] = useState<boolean>(false);
    const [postTitle, setPostTitle] = useState<string | null>(null);
    const [postError, setPostError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                feature_image: initialData.feature_image || null,
                published_date: initialData.published_date ? initialData.published_date.split('T')[0] : '',
                application_deadline: initialData.application_deadline ? initialData.application_deadline.split('T')[0] : '',
                country: initialData.country || '',
                degree_level: initialData.degree_level || '',
                funding_type: initialData.funding_type || '',
                ielts_required: initialData.ielts_required || '',
                last_verified_date: initialData.last_verified_date ? initialData.last_verified_date.split('T')[0] : '',
                source: initialData.source || '',
                reference_post_id: initialData.reference_post_id || null,
            });

            if (initialData.post) {
                setPostTitle(initialData.post.title);
            }
        }
    }, [initialData]);

    // Verify reference_post_id when it changes
    useEffect(() => {
        if (initialData?.post && initialData.reference_post_id === formData.reference_post_id) {
            setPostTitle(initialData.post.title);
            setPostError(null);
            setVerifyingPost(false);
            return;
        }

        if (!formData.reference_post_id) {
            setPostTitle(null);
            setPostError(null);
            setVerifyingPost(false);
            return;
        }

        let isMounted = true;
        const timer = setTimeout(async () => {
            setVerifyingPost(true);
            setPostError(null);
            setPostTitle(null);

            try {
                const res = await authFetch(`${BASE_URL}admin/posts/view/${formData.reference_post_id}`);
                if (!isMounted) return;

                if (res.ok) {
                    const data = await res.json();
                    const title = data.data?.title || data.title;
                    if (title) {
                        setPostTitle(title);
                        setPostError(null);
                    } else {
                        setPostError('Invalid Post ID');
                        setPostTitle(null);
                    }
                } else {
                    setPostError('Invalid Post ID');
                    setPostTitle(null);
                }
            } catch (err) {
                if (!isMounted) return;
                setPostError('Invalid Post ID');
                setPostTitle(null);
            } finally {
                if (isMounted) setVerifyingPost(false);
            }
        }, 350);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [formData.reference_post_id, authFetch, initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCountryChange = (country: string) => {
        setFormData(prev => ({ ...prev, country }));
    };

    const OpenModal = (flag: boolean, isFeature: boolean): void => {
        setIsOpen(flag);
        setIsFeature(isFeature);
    };

    const UpdateFeatureImage = useCallback((imageData: ImageData): void => {
        setFormData((prev: any) => ({ ...prev, feature_image: imageData.url }));
    }, []);

    const handleExternalImageInsert = (imageData: ImageData): void => {
        if (editorRef.current) {
            editorRef.current.insertImageIntoEditor({
                file_url: imageData.url,
                width: imageData.dimensions.width,
                height: imageData.dimensions.height,
                thumb: imageData.thumbnails[0]?.file_url || imageData.url
            });
        }
        setIsOpen(false);
    };

    const handlePublishedDateChange = useCallback((selectedDates: Date[], dateStr: string) => {
        setFormData(prev => ({ ...prev, published_date: dateStr }));
    }, []);

    const handleApplicationDeadlineChange = useCallback((selectedDates: Date[], dateStr: string) => {
        setFormData(prev => ({ ...prev, application_deadline: dateStr }));
    }, []);

    const handleLastVerifiedDateChange = useCallback((selectedDates: Date[], dateStr: string) => {
        setFormData(prev => ({ ...prev, last_verified_date: dateStr }));
    }, []);

    const handleDescriptionChange = useCallback((content: string) => {
        setFormData(prev => ({ ...prev, description: content }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentContent = editorRef.current?.getCurrentContent();
        const descriptionToSave = (currentContent !== undefined && currentContent !== null) 
            ? currentContent 
            : formData.description;
        
        await onSubmit({
            ...formData,
            description: descriptionToSave
        });
    };

    const Header = () => (
        <div className="flex justify-between my-4 items-center">
            <h2 className="text-xl font-bold dark:text-white">
                {initialData ? 'Edit Scholarship' : 'Create Scholarship'}
            </h2>
            <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : (initialData ? 'Update Scholarship' : 'Save Scholarship')}
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <Header />

            <div className="grid grid-cols-5 gap-8">
                {/* Left Column */}
                <div className="col-span-5 order-1 md:order-none md:col-span-3 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter scholarship title..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Country
                        </label>
                        <SearchableCountrySelect
                            value={formData.country || ''}
                            onChange={handleCountryChange}
                            placeholder="Select or search country..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Degree Level
                        </label>
                        <select
                            name="degree_level"
                            value={formData.degree_level || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Degree Level</option>
                            <option value="Bachelor's">Bachelor's</option>
                            <option value="Master's">Master's</option>
                            <option value="PhD">PhD</option>
                            <option value="Diploma">Diploma</option>
                            {formData.degree_level && !["Bachelor's", "Master's", "PhD", "Diploma"].includes(formData.degree_level) && (
                                <option value={formData.degree_level}>{formData.degree_level}</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Funding Type
                        </label>
                        <select
                            name="funding_type"
                            value={formData.funding_type || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Funding Type</option>
                            <option value="Fully Funded">Fully Funded</option>
                            <option value="Partial">Partial</option>
                            <option value="Tuition Waiver">Tuition Waiver</option>
                            {formData.funding_type && !['Fully Funded', 'Partial', 'Tuition Waiver'].includes(formData.funding_type) && (
                                <option value={formData.funding_type}>{formData.funding_type}</option>
                            )}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            IELTS Required
                        </label>
                        <select
                            name="ielts_required"
                            value={formData.ielts_required || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Select IELTS Requirement</option>
                            <option value="Required">Required</option>
                            <option value="Not required">Not required</option>
                            <option value="Not specified">Not specified</option>
                            {formData.ielts_required && !['Required', 'Not required', 'Not specified'].includes(formData.ielts_required) && (
                                <option value={formData.ielts_required}>{formData.ielts_required}</option>
                            )}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Source / Link
                        </label>
                        <input
                            type="url"
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-5 order-3 md:order-none md:col-span-2 md:col-start-4 space-y-6">
                    <div>
                        <DatePicker
                            id="published_date"
                            label="Published Date"
                            defaultDate={initialData?.published_date || ''}
                            onChange={handlePublishedDateChange}
                        />
                    </div>

                    <div>
                        <DatePicker
                            id="application_deadline"
                            label="Application Deadline"
                            defaultDate={initialData?.application_deadline || ''}
                            onChange={handleApplicationDeadlineChange}
                        />
                    </div>
                    
                    <div>
                        <DatePicker
                            id="last_verified_date"
                            label="Last Verified Date"
                            defaultDate={initialData?.last_verified_date || ''}
                            onChange={handleLastVerifiedDateChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reference Post ID
                        </label>
                        <input
                            type="number"
                            name="reference_post_id"
                            value={formData.reference_post_id || ''}
                            onChange={handleInputChange}
                            placeholder="ID of related post (optional)"
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-800 text-gray-900 dark:text-white ${
                                postError
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : postTitle
                                    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {verifyingPost && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Verifying Post ID...</p>
                        )}
                        {!verifyingPost && postTitle && (
                            <p className="mt-1.5 text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                {postTitle}
                            </p>
                        )}
                        {!verifyingPost && postError && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                {postError}
                            </p>
                        )}
                    </div>
                </div>

                {/* WYSIWYG Editor */}
                <div className="col-span-5 order-2 md:order-none md:row-start-2">
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </div>
                    <WysiwygEditor
                        ref={editorRef}
                        OpenModal={OpenModal}
                        updatePostContent={handleDescriptionChange}
                        postContent={formData.description}
                    />
                </div>
            </div>

            <div className="container mx-auto mt-6 grid md:grid-cols-3 gap-6">
                {/* Feature Image Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm w-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Feature Image</h3>
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        <FeatureImageUploader
                            featured_image={formData.feature_image as string || null}
                            OpenModal={OpenModal}
                        />
                    </div>
                </div>
            </div>

            <ImageUploaderModal
                isOpen={isOpen}
                callback={
                    isFeature
                        ? UpdateFeatureImage
                        : (imageData: ImageData) => {
                            handleExternalImageInsert(imageData);
                        }
                }
                OpenModal={OpenModal}
            />

            <Header />
        </div>
    );
}

