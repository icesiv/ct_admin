'use client';

import { User } from '@/types/user';
import React, { useState, useEffect } from "react";
import { BASE_URL } from "@/config/config";

interface EditFormData {
  name: string;
  email: string;
  phone: string;
  user_role: string;
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
}


export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  if (!user || !isOpen) {
    return null;
  }

  const [formData, setFormData] = useState<EditFormData>({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    user_role: user.user_role,
    profile_image: user.profile_image,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        user_role: user.user_role || 'user',
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
        return `/storage/images/${profileImage}`;
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

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      user_role: '',
      profile_image: null
    });
    setImageFile(null);
    setImagePreview(null);
    setValidationErrors({});
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

      // Prepare data for API
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        user_role: formData.user_role,
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

  const handleResetPassword = async () => {
    if (!user) return;

    if (!window.confirm(`Are you sure you want to reset the password for ${user.name}? The new password will be 'password'.`)) {
      return;
    }

    try {
      setResettingPassword(true);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${BASE_URL}admin/user/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }

    } catch (err) {
      console.error('Error resetting password:', err);
      alert('Error resetting password: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setResettingPassword(false);
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
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {/* Reset Password Button Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {resettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2 dark:text-gray-400">
                This will set the password to default: 'password'
              </p>
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