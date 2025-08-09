'use client';

import { User } from '@/types/user';
import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/config/config";

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  user_role: string;
  password: string;
  password_confirmation: string;
  profile_image: string | null;
}

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
}


export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  if (!user || !isOpen) {
    return null;
  }

const [formData, setFormData] = useState<EditFormData>({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    user_role: user.user_role, // Rely on user.user_role being a string
    password: '',
    password_confirmation: '',
    profile_image: user.profile_image,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        user_role: user.user_role || 'user',
        password: '',
        password_confirmation: '',
        profile_image: user.profile_image
      });
      setImageFile(null);
      setValidationErrors({});
      // Set current profile image as preview
      setImagePreview(user.profile_image ? getProfileImage(user.profile_image) : null);
    }
  }, [user]);

  const getProfileImage = (profileImage: string | null) => {
    if (profileImage) {
      // Handle both full URLs and relative paths
      if (profileImage.startsWith('http')) {
        return profileImage;
      } else {
        return `http://newsapi.test/storage/images/${profileImage}`;
      }
    }
    return '/images/user/default-avatar.jpg';
  };

  // Email validation
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  // Phone validation
  const validatePhone = (phone: string): string | null => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number (at least 10 digits)';
    }
    return null;
  };

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password && password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  // Password confirmation validation
  const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
    if (password && password !== confirmation) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      user_role: '',
      password: '',
      password_confirmation: '',
      profile_image: null
    });
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) {
          newErrors.email = emailError;
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        const phoneError = validatePhone(value);
        if (phoneError) {
          newErrors.phone = phoneError;
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        const passwordError = validatePassword(value);
        if (passwordError) {
          newErrors.password = passwordError;
        } else {
          delete newErrors.password;
        }
        // Also validate password confirmation when password changes
        const confirmationError = validatePasswordConfirmation(value, formData.password_confirmation);
        if (confirmationError) {
          newErrors.password_confirmation = confirmationError;
        } else {
          delete newErrors.password_confirmation;
        }
        break;
      case 'password_confirmation':
        const confirmError = validatePasswordConfirmation(formData.password, value);
        if (confirmError) {
          newErrors.password_confirmation = confirmError;
        } else {
          delete newErrors.password_confirmation;
        }
        break;
    }

    setValidationErrors(newErrors);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profile_image: null
    }));
    // Clear the file input
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    // Validate password (if provided)
    if (formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;

      const confirmationError = validatePasswordConfirmation(formData.password, formData.password_confirmation);
      if (confirmationError) errors.password_confirmation = confirmationError;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate form before proceeding
    if (!validateForm()) {
      alert('Please fix all validation errors before saving');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // If there's an image file, upload it first
      let profileImagePath = formData.profile_image;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profile_image', imageFile);
        imageFormData.append('user_id', user.id.toString());

        const imageResponse = await fetch(BASE_URL + 'admin/user/upload-profile-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          if (imageResult.success) {
            profileImagePath = imageResult.data.user.profile_image;
          }
        } else {
          console.warn('Image upload failed, proceeding without image update');
        }
      }

      // Prepare data for API - only include password if it's provided
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        user_role: formData.user_role,
        ...(formData.password && { password: formData.password }),
        ...(formData.password_confirmation && { password_confirmation: formData.password_confirmation }),
        ...(profileImagePath !== undefined && { profile_image: profileImagePath })
      };

      // Make API call to update user
      const response = await fetch(BASE_URL + `admin/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Create updated user object
        const updatedUser: User = {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          user_role: formData.user_role,
          profile_image: profileImagePath
        };

        onSave(updatedUser);
        handleClose();
        alert('User updated successfully!');
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit User
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profile-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-image-input')?.click()}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Choose Image
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${validationErrors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +1234567890 or (123) 456-7890"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${validationErrors.phone
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                name="user_role"
                value={formData.user_role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${validationErrors.password
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${validationErrors.password_confirmation
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {validationErrors.password_confirmation}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}