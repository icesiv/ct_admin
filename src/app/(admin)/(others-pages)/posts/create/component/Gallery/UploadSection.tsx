import React, { useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Upload, Tag, X, FileImage } from 'lucide-react';

interface UploadSectionProps {
    loading: boolean;
    uploadStatus: { type: 'success' | 'error' | null; message: string };
    VALIDATION_RULES: {
        maxFileSize?: number;
        allowedTypes?: string[];
        title: {
            minLength: number;
            maxLength: number;
        };
        tags: {
            maxCount: number;
            maxLength: number;
        };
        images: {
            allowedTypes: string[];
            maxSize: number;
        };
    };
}

const UploadSection = ({ loading, uploadStatus, VALIDATION_RULES }: UploadSectionProps) => {
    // State variables
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentTags, setCurrentTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [invalidFiles, setInvalidFiles] = useState<{ file: File; reason: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        title?: string;
        tags?: string;
        images?: string;
    }>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Event handlers
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentTitle(value);
        
        // Clear validation error when user starts typing
        if (validationErrors.title) {
            setValidationErrors(prev => ({ ...prev, title: undefined }));
        }
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < VALIDATION_RULES.tags.maxCount) {
            setCurrentTags(prev => [...prev, trimmedTag]);
            setTagInput('');
            
            // Clear validation error
            if (validationErrors.tags) {
                setValidationErrors(prev => ({ ...prev, tags: undefined }));
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        
        if (isUploading) return;
        
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
    };

    const processFiles = (files: File[]) => {
        const validFiles: File[] = [];
        const invalid: { file: File; reason: string }[] = [];

        files.forEach(file => {
            if (!VALIDATION_RULES.images.allowedTypes.includes(file.type)) {
                invalid.push({ file, reason: 'Invalid file type' });
            } else if (file.size > VALIDATION_RULES.images.maxSize) {
                invalid.push({ file, reason: 'File too large' });
            } else {
                validFiles.push(file);
            }
        });

        setPendingFiles(prev => [...prev, ...validFiles]);
        setInvalidFiles(prev => [...prev, ...invalid]);
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeInvalidFile = (index: number) => {
        setInvalidFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPendingFiles = async () => {
        setIsUploading(true);
        
        try {
            // Simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Clear pending files on successful upload
            setPendingFiles([]);
            setCurrentTitle('');
            setCurrentTags([]);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const cancelUpload = () => {
        setPendingFiles([]);
        setInvalidFiles([]);
        setCurrentTitle('');
        setCurrentTags([]);
        setTagInput('');
    };

    return (
        <div className="space-y-4">
            {/* Loading State */}
            {loading && (
                <div className="p-3 rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Loading images...</span>
                </div>
            )}

            {/* Upload Status */}
            {uploadStatus && uploadStatus.type && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${uploadStatus.type === 'success'
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
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="image-title">
                    Title <span className="text-xs text-gray-500">({VALIDATION_RULES.title.minLength}-{VALIDATION_RULES.title.maxLength} chars)</span>
                </label>
                <input
                    id="image-title"
                    type="text"
                    value={currentTitle}
                    onChange={handleTitleChange}
                    placeholder="Enter a title for your images"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${validationErrors.title
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    maxLength={VALIDATION_RULES.title.maxLength}
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
            <div>
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
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${validationErrors.tags
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
                className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors cursor-pointer ${isUploading
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
                <Upload size={isMobile ? 24 : 32} className="mx-auto mb-2 sm:mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                    {isUploading ? 'Uploading...' : isMobile ? 'Tap to select images' : 'Drop images here or click'}
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
                <div>
                    <h4 className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Rejected Files ({invalidFiles.length})
                    </h4>
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                        {invalidFiles.map((item, index) => (
                            <div key={`invalid-${index}`} className="flex items-start justify-between py-2 border-b border-red-200 last:border-b-0">
                                <div className="flex-1 min-w-0 pr-2">
                                    <span className="text-xs font-medium text-red-800 block truncate">{item.file.name}</span>
                                    <p className="text-xs text-red-600 mt-1">{item.reason}</p>
                                </div>
                                <button
                                    onClick={() => removeInvalidFile(index)}
                                    className="p-1 hover:bg-red-100 rounded flex-shrink-0"
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
                <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FileImage size={12} />
                        Selected Files ({pendingFiles.length})
                    </h4>
                    <div className="bg-white rounded-lg p-2 mb-3 border">
                        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {pendingFiles.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 px-2 py-2 rounded text-xs">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <span className="font-medium block truncate">{file.name}</span>
                                        <p className="text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removePendingFile(index)}
                                        className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                                        type="button"
                                        aria-label={`Remove ${file.name}`}
                                        disabled={isUploading}
                                    >
                                        <X size={12} className="text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={uploadPendingFiles}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs flex-1"
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
    );
};

export default UploadSection;