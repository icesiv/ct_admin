"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { BASE_URL } from "@/config/config";
import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
    name: string;
    short_bio: string;
    social_links: {
        facebook: string;
        twitter: string;
        linkedin: string;
        instagram: string;
    };
}

interface Message {
    type: 'success' | 'error' | '';
    text: string;
}

export default function CreateAuthorForm() {
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<Message>({ type: '', text: '' });
    const [formData, setFormData] = useState<FormData>({
        name: '',
        short_bio: '',
        social_links: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        }
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [name]: value
            }
        }));
    }

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select a valid image file' });
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
                return;
            }

            setProfileImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        // Reset the file input
        const fileInput = document.getElementById('profile_image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('auth_token');

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('short_bio', formData.short_bio);

            if (profileImage) {
                submitData.append('profile_image', profileImage);
            }

            // Send social_links as JSON string
            submitData.append('social_links', JSON.stringify(formData.social_links));

            const response = await fetch(BASE_URL + 'admin/authors', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // Content-Type is set automatically for FormData
                },
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create author');
            }

            setMessage({
                type: 'success',
                text: 'Author profile created successfully!'
            });

            // Reset form
            setFormData({
                name: '',
                short_bio: '',
                social_links: {
                    facebook: '',
                    twitter: '',
                    linkedin: '',
                    instagram: ''
                }
            });
            removeImage();

        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to create author.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col justify-center flex-1 w-full max-w-xl mx-auto">

            <form onSubmit={handleSubmit}>

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-5">

                    {/* Profile Image Upload - Mimicking CreateUser style */}
                    <div className="sm:col-span-1">
                        <Label>Profile Image</Label>
                        <div className="flex flex-col items-center space-y-3">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Profile preview"
                                        className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                            <input
                                type="file"
                                id="profile_image"
                                name="profile_image"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('profile_image')?.click()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:bg-gray-800 dark:text-white/90 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Choose Image
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-1">
                        <Label>
                            Name<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            name="name"
                            defaultValue={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter author name"
                        />
                    </div>

                    {/* Short Bio */}
                    <div>
                        <Label>Short Bio</Label>
                        <textarea
                            name="short_bio"
                            value={formData.short_bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400"
                            placeholder="Brief description about the author..."
                        ></textarea>
                    </div>

                    {/* Social Links */}
                    <div>
                        <Label>Social Links</Label>
                        <div className="space-y-3">
                            <Input
                                type="text"
                                name="facebook"
                                defaultValue={formData.social_links.facebook}
                                onChange={handleSocialChange}
                                placeholder="Facebook URL"
                            />
                            <Input
                                type="text"
                                name="twitter"
                                defaultValue={formData.social_links.twitter}
                                onChange={handleSocialChange}
                                placeholder="Twitter/X URL"
                            />
                            <Input
                                type="text"
                                name="instagram"
                                defaultValue={formData.social_links.instagram}
                                onChange={handleSocialChange}
                                placeholder="Instagram URL"
                            />
                            <Input
                                type="text"
                                name="linkedin"
                                defaultValue={formData.social_links.linkedin}
                                onChange={handleSocialChange}
                                placeholder="LinkedIn URL"
                            />
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Author...
                            </>
                        ) : (
                            'Create Author'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
