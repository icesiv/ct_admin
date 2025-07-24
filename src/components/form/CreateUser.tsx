"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { BASE_URL } from "@/config/config";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
    name: string;
    user_role: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
}

interface Message {
    type: 'success' | 'error' | '';
    text: string;
}

export default function CreateUserForm() {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<Message>({ type: '', text: '' });
    const [formData, setFormData] = useState<FormData>({
        name: '',
        user_role: 'author',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    const validateForm = (): boolean => {
        const { name, email, phone, password, confirm_password } = formData;

        // Check required fields
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Full name is required' });
            return false;
        }

        if (!email.trim()) {
            setMessage({ type: 'error', text: 'Email address is required' });
            return false;
        }

        if (!phone.trim()) {
            setMessage({ type: 'error', text: 'Phone number is required' });
            return false;
        }

        if (!password.trim()) {
            setMessage({ type: 'error', text: 'Password is required' });
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ type: 'error', text: 'Please enter a valid email address' });
            return false;
        }

        // Phone validation (basic)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
            setMessage({ type: 'error', text: 'Please enter a valid phone number' });
            return false;
        }

        // Password validation
        if (password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return false;
        }

        // Confirm password validation
        if (password !== confirm_password) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        // Validate form
        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            // Prepare form data for submission
            const submitData = new FormData();

            // Add text fields
            submitData.append('name', formData.name);
            submitData.append('user_role', formData.user_role);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            submitData.append('password', formData.password);
            submitData.append('password_confirmation', formData.confirm_password);

            // Add profile image if selected
            if (profileImage) {
                submitData.append('profile_image', profileImage);
            }

            const response = await fetch(BASE_URL + 'admin/user/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    // Note: Don't set Content-Type for FormData, let browser set it
                },
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const result = await response.json();

            setMessage({
                type: 'success',
                text: 'User account created successfully!'
            });

            // Reset form after successful creation
            setFormData({
                name: '',
                user_role: 'author',
                email: '',
                phone: '',
                password: '',
                confirm_password: ''
            });

            // Clear image
            setProfileImage(null);
            setImagePreview(null);
            const fileInput = document.getElementById('profile_image') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }

        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to create user. Please try again.'
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
                    {/* Profile Image Upload */}
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

               

                    {/* Full Name */}
                    <div className="sm:col-span-1">
                        <Label>
                            Full Name<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* User Role */}
                    <div className="sm:col-span-1">
                        <Label>
                            User Role
                        </Label>
                        <select
                            id="user_role"
                            name="user_role"
                            defaultValue={formData.user_role}
                            onChange={handleInputChange}
                            className="h-11 w-full text-center rounded-lg border py-2.5 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 0 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                        >
                            <option value="user">Author</option>
                            <option value="admin">Editor</option>
                            <option value="admin">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Email */}
                    <div>
                        <Label>
                            Email Address<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                          
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <Label>
                            Phone Number<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            defaultValue={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label>
                            Password<span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                defaultValue={formData.password}
                                onChange={handleInputChange}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label>
                            Confirm Password<span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                placeholder="Confirm your password"
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm_password"
                                name="confirm_password"
                                defaultValue={formData.confirm_password}
                                onChange={handleInputChange}
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showConfirmPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                )}
                            </span>
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
                                Creating User...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}