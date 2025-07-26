
import React, { useState, useRef, useEffect, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import { X, Upload, Tag, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import { BASE_URL } from '@/config/config';
import { ImagesSection } from './ImagesSection';

// Type definitions
interface ImageData {
  id: number;
  url: string;
  tags: string[];
  name: string;
  fileName?: string;
}

interface ApiImageData {
  id: number;
  title: string;
  tag: string | null;
  image_object: {
    original_name: string;
    file_name: string;
    file_path: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    dimensions: {
      width: number;
      height: number;
    };
    thumbnails: Array<{
      name: string;
      file_name: string;
      file_path: string;
      file_url: string;
      width: number;
      height: number;
      file_size: number;
    }>;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ApiResponse {
  success: boolean;
  data: ApiImageData[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

interface ImageUploaderModalProps {
  initialImages?: ImageData[];
  onImagesChange?: (images: ImageData[]) => void;
  isOpen: boolean;
  callback?: (imageData: ImageData) => void;
  OpenModal: (flag: boolean, isFeature: boolean) => void;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface ValidationErrors {
  title?: string;
  tags?: string;
  images?: string;
}

interface FileValidationResult {
  valid: File[];
  invalid: Array<{ file: File; reason: string }>;
}

const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({ 
  initialImages = [],
  onImagesChange,
  isOpen=false,
  callback,
  OpenModal
}) => {
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [totalImages, setTotalImages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [invalidFiles, setInvalidFiles] = useState<Array<{ file: File; reason: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validation constants
  const VALIDATION_RULES = {
    title: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_.,!()]+$/,
      required: true
    },
    tags: {
      maxCount: 10,
      minLength: 2,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9\-_]+$/,
      required: false
    },
    images: {
      maxSize: 10 * 1024 * 1024, // 10MB
      minSize: 1024, // 1KB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxCount: 20,
      maxDimensions: { width: 8000, height: 8000 },
      minDimensions: { width: 50, height: 50 }
    }
  };

  // API endpoint configuration
  const API_ENDPOINT = BASE_URL+'admin/images/upload-image/gallery';

  // Transform API data to local ImageData format
  const transformApiDataToImageData = (apiData: ApiImageData[]): ImageData[] => {
    return apiData.map(item => ({
      id: item.id,
      url: item.image_object.file_url,
      tags: item.tag ? item.tag.split(',').map(tag => tag.trim()) : [],
      name: item.title,
      fileName: item.image_object.original_name,
      dimensions: item.image_object.dimensions,
      thumbnails: item.image_object.thumbnails
    }));
  };

  // Fetch images from API
  const fetchImages = async (page: number = 1, append: boolean = false, query: string = ''): Promise<void> => {
    if (append) {
      setLoadingMore(true);
    } else if (query) {
      setSearchLoading(true);
    } else {
      setLoading(true);
      setCurrentPage(1);
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Build URL with query parameters
      let url = `${API_ENDPOINT}?page=${page}`;
      if (query.trim()) {
        url += `&query=${encodeURIComponent(query.trim())}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        const transformedImages = transformApiDataToImageData(data.data);
        
        if (append) {
          // Append new images to existing ones
          setImages(prev => {
            const updated = [...prev, ...transformedImages];
            onImagesChange?.(updated);
            return updated;
          });
        } else {
          // Replace images with new ones (initial load or search)
          const allImages = query ? transformedImages : [...transformedImages, ...initialImages];
          setImages(allImages);
          onImagesChange?.(allImages);
        }
        
        // Update pagination info
        setCurrentPage(data.pagination.current_page);
        setHasMorePages(data.pagination.has_more_pages);
        setTotalImages(data.pagination.total);
        
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: 'Failed to fetch images from server' 
        });
      }
    } catch (error) {
      console.error('Fetch images error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to load images. Please check your connection and try again.' 
      });
    } finally {
      if (append) {
        setLoadingMore(false);
      } else if (query) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Search images with debouncing
  const searchImages = async (query: string): Promise<void> => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, reset to normal mode
    if (!query.trim()) {
      setIsSearchMode(false);
      fetchImages(1, false, '');
      return;
    }

    // Set search mode
    setIsSearchMode(true);

    // Debounce the search API call
    searchTimeoutRef.current = setTimeout(() => {
      fetchImages(1, false, query);
    }, 500); // 500ms debounce
  };

  // Load more images (works for both normal and search mode)
  const loadMoreImages = (): void => {
    if (!loadingMore && hasMorePages) {
      const query = isSearchMode ? searchTerm : '';
      fetchImages(currentPage + 1, true, query);
    }
  };

  // Load images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages(1, false, '');
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen]);

  

  // Validation functions
  const validateTitle = (title: string): string | null => {
    const trimmed = title.trim();
    
    if (VALIDATION_RULES.title.required && !trimmed) {
      return 'Title is required';
    }
    
    if (trimmed.length < VALIDATION_RULES.title.minLength) {
      return `Title must be at least ${VALIDATION_RULES.title.minLength} characters long`;
    }
    
    if (trimmed.length > VALIDATION_RULES.title.maxLength) {
      return `Title must not exceed ${VALIDATION_RULES.title.maxLength} characters`;
    }
    
    if (!VALIDATION_RULES.title.pattern.test(trimmed)) {
      return 'Title contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed';
    }
    
    return null;
  };

  const validateTag = (tag: string): string | null => {
    const trimmed = tag.trim();
    
    if (!trimmed) {
      return 'Tag cannot be empty';
    }
    
    if (trimmed.length < VALIDATION_RULES.tags.minLength) {
      return `Tag must be at least ${VALIDATION_RULES.tags.minLength} characters long`;
    }
    
    if (trimmed.length > VALIDATION_RULES.tags.maxLength) {
      return `Tag must not exceed ${VALIDATION_RULES.tags.maxLength} characters`;
    }
    
    if (!VALIDATION_RULES.tags.pattern.test(trimmed)) {
      return 'Tag can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (currentTags.includes(trimmed)) {
      return 'This tag already exists';
    }
    
    if (currentTags.length >= VALIDATION_RULES.tags.maxCount) {
      return `Maximum ${VALIDATION_RULES.tags.maxCount} tags allowed`;
    }
    
    return null;
  };

  const validateImageDimensions = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width < VALIDATION_RULES.images.minDimensions.width || 
            img.height < VALIDATION_RULES.images.minDimensions.height) {
          resolve(`Image dimensions too small. Minimum: ${VALIDATION_RULES.images.minDimensions.width}x${VALIDATION_RULES.images.minDimensions.height}px`);
          return;
        }
        
        if (img.width > VALIDATION_RULES.images.maxDimensions.width || 
            img.height > VALIDATION_RULES.images.maxDimensions.height) {
          resolve(`Image dimensions too large. Maximum: ${VALIDATION_RULES.images.maxDimensions.width}x${VALIDATION_RULES.images.maxDimensions.height}px`);
          return;
        }
        
        resolve(null);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('Invalid image file');
      };
      
      img.src = url;
    });
  };

  const validateFiles = async (files: File[]): Promise<FileValidationResult> => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; reason: string }> = [];
    
    if (files.length > VALIDATION_RULES.images.maxCount) {
      return {
        valid: [],
        invalid: files.map(file => ({ file, reason: `Maximum ${VALIDATION_RULES.images.maxCount} files allowed at once` }))
      };
    }
    
    for (const file of files) {
      // Check file type
      if (!VALIDATION_RULES.images.allowedTypes.includes(file.type)) {
        invalid.push({ 
          file, 
          reason: `Invalid file type. Allowed: ${VALIDATION_RULES.images.allowedTypes.join(', ')}` 
        });
        continue;
      }
      
      // Check file size
      if (file.size < VALIDATION_RULES.images.minSize) {
        invalid.push({ 
          file, 
          reason: `File too small. Minimum size: ${Math.round(VALIDATION_RULES.images.minSize / 1024)}KB` 
        });
        continue;
      }
      
      if (file.size > VALIDATION_RULES.images.maxSize) {
        invalid.push({ 
          file, 
          reason: `File too large. Maximum size: ${Math.round(VALIDATION_RULES.images.maxSize / 1024 / 1024)}MB` 
        });
        continue;
      }
      
      // Check dimensions
      const dimensionError = await validateImageDimensions(file);
      if (dimensionError) {
        invalid.push({ file, reason: dimensionError });
        continue;
      }
      
      valid.push(file);
    }
    
    return { valid, invalid };
  };

  const clearValidationError = (field: keyof ValidationErrors): void => {
    setValidationErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleFileSelect = async (files: FileList | null): Promise<void> => {
    if (!files) return;
    
    const filesArray = Array.from(files);
    const validationResult = await validateFiles(filesArray);
    
    if (validationResult.invalid.length > 0) {
      setInvalidFiles(validationResult.invalid);
      setUploadStatus({ 
        type: 'error', 
        message: `${validationResult.invalid.length} file(s) rejected. Check details below.` 
      });
    } else {
      setInvalidFiles([]);
      clearValidationError('images');
    }
    
    if (validationResult.valid.length > 0) {
      setPendingFiles(prev => [...prev, ...validationResult.valid]);
      setUploadStatus({ type: null, message: '' });
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (): void => {
    setDragActive(false);
  };

  const uploadToAPI = async (file: File, title: string, tags: string[]): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // 1. image (binary)
    formData.append('image', file);
    
    // 2. generate_thumbnails
    formData.append('generate_thumbnails', 'true');
    
    // 3. thumbnail_sizes[]
    formData.append('thumbnail_sizes[]', '400');
    formData.append('thumbnail_sizes[]', '500');
    
    // 4. title
    formData.append('title', title);
    
    // 5. tag (multiple tags)
    tags.forEach(tag => {
      formData.append('tag[]', tag);
    });
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  };

  const uploadPendingFiles = async (): Promise<void> => {
    // Validate all fields before upload
    const titleError = validateTitle(currentTitle);
    const errors: ValidationErrors = {};
    
    if (titleError) {
      errors.title = titleError;
    }
    
    if (pendingFiles.length === 0) {
      errors.images = 'No files selected for upload';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setUploadStatus({ type: 'error', message: 'Please fix the validation errors before uploading' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });
    setValidationErrors({});

    try {
      const uploadPromises = pendingFiles.map(file => uploadToAPI(file, currentTitle.trim(), currentTags));
      const results = await Promise.all(uploadPromises);
      
      const failedUploads = results.filter(result => !result.success);
      
      if (failedUploads.length === 0) {
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully uploaded ${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''}` 
        });
        console.log('failedUploads', failedUploads);
        // Add successful uploads to local state for preview
        const newImages: ImageData[] = [];
        
        pendingFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
              const newImage: ImageData = {
                id: Date.now() + Math.random() + index,
                url: e.target.result as string,
                tags: [...currentTags],
                name: currentTitle.trim(),
                fileName: file.name
              };
              newImages.push(newImage);
              
              // Update state when all files are processed
              if (newImages.length === pendingFiles.length) {
                setImages(prev => {
                  const updated = [...newImages, ...prev];
                  onImagesChange?.(updated);
                  return updated;
                });
              }
            }
          };
          reader.readAsDataURL(file);
        });
        
        // Reset form
        setPendingFiles([]);
        setCurrentTags([]);
        setCurrentTitle('');
        setInvalidFiles([]);
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: `${failedUploads.length} out of ${pendingFiles.length} uploads failed. ${failedUploads[0].message || 'Please try again.'}` 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed. Please check your connection and try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = (): void => {
    setPendingFiles([]);
    setCurrentTags([]);
    setCurrentTitle('');
    setInvalidFiles([]);
    setValidationErrors({});
    setUploadStatus({ type: null, message: '' });
  };

  const addTag = (): void => {
    const tagError = validateTag(tagInput);
    
    if (tagError) {
      setValidationErrors(prev => ({ ...prev, tags: tagError }));
      return;
    }
    
    setCurrentTags([...currentTags, tagInput.trim()]);
    setTagInput('');
    clearValidationError('tags');
  };

  const removeTag = (tagToRemove: string): void => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    clearValidationError('tags');
  };

  const deleteImage = (imageId: number): void => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const removePendingFile = (indexToRemove: number): void => {
    setPendingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeInvalidFile = (indexToRemove: number): void => {
    setInvalidFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleFileSelect(e.target.files);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchTerm(value);
    searchImages(value);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCurrentTitle(e.target.value);
    clearValidationError('title');
  };

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setTagInput(e.target.value);
    clearValidationError('tags');
  };

  return (
    <>
      {/* Open Modal Button */}
      {/* <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
        type="button"
      >
        Open Image Manager
      </button> */}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Image Manager</h2>
              <button
                onClick={() => {
                  OpenModal(false, false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Two Column Layout */}
            <div className="flex h-[calc(90vh-88px)]">
              {/* Left Column - Upload Area */}
              <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Upload New Images</h3>
                  
                  {/* Loading State */}
                  {loading && (
                    <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm">Loading images...</span>
                    </div>
                  )}
                  
                  {/* Upload Status */}
                  {uploadStatus.type && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                      uploadStatus.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="text-sm">{uploadStatus.message}</span>
                    </div>
                  )}
                  
                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="image-title">
                      Title * <span className="text-xs text-gray-500">({VALIDATION_RULES.title.minLength}-{VALIDATION_RULES.title.maxLength} chars)</span>
                    </label>
                    <input
                      id="image-title"
                      type="text"
                      value={currentTitle}
                      onChange={handleTitleChange}
                      placeholder="Enter a title for your images"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                        validationErrors.title 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      maxLength={VALIDATION_RULES.title.maxLength}
                      required
                      disabled={isUploading}
                    />
                    {validationErrors.title && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.title}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      {currentTitle.length}/{VALIDATION_RULES.title.maxLength}
                    </div>
                  </div>
                  
                  {/* Tag Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tag-input">
                      Tags <span className="text-xs text-gray-500">(max {VALIDATION_RULES.tags.maxCount})</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="tag-input"
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a tag"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                          validationErrors.tags 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        maxLength={VALIDATION_RULES.tags.maxLength}
                        disabled={isUploading}
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        aria-label="Add tag"
                        disabled={isUploading || !tagInput.trim()}
                      >
                        <Tag size={14} />
                      </button>
                    </div>
                    
                    {validationErrors.tags && (
                      <p className="mb-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.tags}
                      </p>
                    )}
                    
                    {/* Current Tags */}
                    {currentTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {currentTags.map(tag => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:bg-blue-200 rounded-full p-0.5 disabled:opacity-50"
                              type="button"
                              aria-label={`Remove ${tag} tag`}
                              disabled={isUploading}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {currentTags.length}/{VALIDATION_RULES.tags.maxCount} tags
                    </div>
                  </div>

                  {/* File Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                      isUploading 
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        : dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : validationErrors.images
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={isUploading ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!isUploading && (e.key === 'Enter' || e.key === ' ')) {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isUploading ? 'Uploading...' : 'Drop images here or click'}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {VALIDATION_RULES.images.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Max {Math.round(VALIDATION_RULES.images.maxSize / 1024 / 1024)}MB per file
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={VALIDATION_RULES.images.allowedTypes.join(',')}
                      onChange={handleFileInputChange}
                      className="hidden"
                      aria-label="Select images to upload"
                      disabled={isUploading}
                    />
                  </div>

                  {validationErrors.images && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.images}
                    </p>
                  )}

                  {/* Invalid Files */}
                  {invalidFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Rejected Files ({invalidFiles.length})
                      </h4>
                      <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                        {invalidFiles.map((item, index) => (
                          <div key={`invalid-${index}`} className="flex items-center justify-between py-1">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-red-800 block truncate">{item.file.name}</span>
                              <p className="text-xs text-red-600">{item.reason}</p>
                            </div>
                            <button
                              onClick={() => removeInvalidFile(index)}
                              className="p-1 hover:bg-red-100 rounded ml-2"
                              type="button"
                              aria-label={`Remove ${item.file.name}`}
                            >
                              <X size={12} className="text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Files Preview */}
                  {pendingFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FileImage size={12} />
                        Selected Files ({pendingFiles.length})
                      </h4>
                      <div className="bg-white rounded-lg p-2 mb-3 border">
                        <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                          {pendingFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium block truncate">{file.name}</span>
                                <p className="text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={() => removePendingFile(index)}
                                className="p-1 hover:bg-gray-200 rounded ml-2"
                                type="button"
                                aria-label={`Remove ${file.name}`}
                                disabled={isUploading}
                              >
                                <X size={12} className="text-gray-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={uploadPendingFiles}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs flex-1"
                            type="button"
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                Uploading...
                              </>
                            ) : (
                              'Upload Images'
                            )}
                          </button>
                          <button
                            onClick={cancelUpload}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            type="button"
                            disabled={isUploading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Images Section */}
              <ImagesSection 
                images={images}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onDeleteImage={deleteImage}
                loading={loading}
                loadingMore={loadingMore}
                searchLoading={searchLoading}
                hasMorePages={hasMorePages}
                onLoadMore={loadMoreImages}
                totalImages={totalImages}
                currentPage={currentPage}
                isSearchMode={isSearchMode}
                callback={callback}
                OpenModal={OpenModal}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploaderModal;