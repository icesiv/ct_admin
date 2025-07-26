'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
  forwardRef, 
  useImperativeHandle,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';

import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Video,
  type LucideIcon
} from 'lucide-react';
import { BASE_URL } from '@/config/config';

// Types
export interface ImageData {
  file_url: string;
  width?: number;
  height?: number;
  thumb?: string;
}

interface ToolbarButton {
  icon: LucideIcon;
  command?: string;
  action?: () => void;
  title: string;
  divider?: never;
}

interface ToolbarDivider {
  divider: true;
  icon?: never;
  command?: never;
  action?: never;
  title?: never;
}

type ToolbarItem = ToolbarButton | ToolbarDivider;

interface SelectOption {
  label: string;
  value: string;
  command?: string;
}

interface WysiwygEditorProps {
  updatePostContent: (content: string) => void;
  postContent?: string | null;
  baseUrl?: string;
  maxImageSize?: number;
  placeholder?: string;
  className?: string;
  OpenModal: (flag: boolean,isFeature: boolean) => void;
}

// Add interface for the ref methods
export interface WysiwygEditorRef {
  insertImageIntoEditor: (imageData: ImageData) => void;
}

// Custom hooks
const useSelection = () => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
      if (selection.rangeCount > 0) {
        setSavedRange(selection.getRangeAt(0).cloneRange());
      }
    }
  }, []);

  return { selectedText, savedRange, setSavedRange, handleTextSelection };
};

const useImageUpload = (baseUrl: string) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadImage = useCallback(async (file: File): Promise<ImageData> => {
    const token = localStorage.getItem('auth_token');
    const UPLOAD_URL = `${BASE_URL}admin/images/upload-image`;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('generate_thumbnails', 'true');
      formData.append('thumbnail_sizes[]', '500');

      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

        xhr.open('POST', UPLOAD_URL);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.timeout = 30000;
        xhr.send(formData);
      });

      return response.data;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [baseUrl]);

  return { uploading, uploadProgress, uploadImage };
};

// Utility functions
const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const createYouTubeEmbed = (videoId: string, width = 560, height = 315): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'youtube-embed-wrapper';
  wrapper.style.cssText = `
    position: relative;
    width: 100%;
    max-width: ${width}px;
    margin: 20px auto;
    padding: 0;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;

  wrapper.innerHTML = `
    <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
      <iframe 
        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
        frameBorder="0" 
        allowFullScreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        title="YouTube video player"
      ></iframe>
    </div>
  `;

  return wrapper;
};

const fixImageUrls = (htmlContent: string | null | undefined, domain = 'https://campustimes.press'): string => {
  if (!htmlContent) return '';
  const imgRegex = /<img([^>]*)\ssrc="(\/[^"]*)"([^>]*)>/gi;
  return htmlContent.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
    return `<img${beforeSrc} src="${domain}${src}"${afterSrc}>`;
  });
};

// Modal components remain the same...
const LinkModal = memo(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange
}: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter URL..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onInsert}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            type="button"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
});

LinkModal.displayName = 'LinkModal';

const VideoModal = memo(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange
}: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />
        <div className="text-sm text-gray-500 mb-4">
          Supported formats:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>https://www.youtube.com/watch?v=VIDEO_ID...</li>
            <li>https://youtu.be/VIDEO_ID...</li>
            <li>https://www.youtube.com/embed/VIDEO_ID...</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onInsert}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            type="button"
          >
            Insert Video
          </button>
        </div>
      </div>
    </div>
  );
});

VideoModal.displayName = 'VideoModal';

const ImageModal = memo(({
  isOpen,
  onClose,
  onFileSelect,
  uploading,
  uploadProgress,
  fileInputRef
}: {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Insert Image</h3>

        {uploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Uploading image...</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-500">
              {uploadProgress}% complete
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

ImageModal.displayName = 'ImageModal';

// Main component with forwardRef
const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(({
  updatePostContent,
  postContent = null,
  baseUrl = 'https://campustimes.press',
  maxImageSize = 10 * 1024 * 1024, // 10MB
  placeholder = 'Start writing your content here...',
  className = '',
  OpenModal
}, ref) => {
  const [content, setContent] = useState<string>(postContent || '');
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedText, savedRange, setSavedRange, handleTextSelection } = useSelection();
  const { uploading, uploadProgress, uploadImage } = useImageUpload(baseUrl);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const initialContent = postContent ?? '';
      const fixedContent = fixImageUrls(initialContent);
      editorRef.current.innerHTML = fixedContent;
      setContent(fixedContent);
      setIsInitialized(true);
    }
  }, [postContent, isInitialized]);

  // Update parent component
  useEffect(() => {
    if (isInitialized && content !== postContent) {
      updatePostContent(content);
    }
  }, [content, updatePostContent, isInitialized, postContent]);

  // Command execution
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value ?? "");
    editorRef.current?.focus();
  }, []);

  // Font handling
  const handleFontFamily = useCallback((fontFamily: string) => {
    editorRef.current?.focus();
    const selection = window.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontFamily = fontFamily;

        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
          if (editorRef.current) setContent(editorRef.current.innerHTML);
        } catch (error) {
          execCommand('fontName', fontFamily);
        }
      } else {
        execCommand('fontName', fontFamily);
      }
    }
  }, [execCommand]);

  const handleFontSize = useCallback((size: string) => {
    editorRef.current?.focus();
    const selection = window.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = size;

        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
          if (editorRef.current) setContent(editorRef.current.innerHTML);
        } catch (error) {
          execCommand('fontSize', '3');
        }
      } else {
        execCommand('fontSize', '3');
      }
    }
  }, [execCommand]);

  // Image handling - This is the method that will be exposed
  const insertImageIntoEditor = useCallback((imageData: ImageData) => {
    console.log('Hola', imageData);
    const img = document.createElement('img');
    img.src = imageData.file_url;
    img.alt = 'Uploaded image';

    if (imageData.width && imageData.height) {
      img.setAttribute('data-width', imageData.width.toString());
      img.setAttribute('data-height', imageData.height.toString());
    }

    if (imageData.thumb) {
      img.setAttribute('data-thumb', imageData.thumb);
    }

    Object.assign(img.style, {
      width: '100%',
      maxWidth: '600px',
      height: 'auto',
      margin: '10px 0',
      display: 'block',
      borderRadius: '4px'
    });

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(img);

      const br = document.createElement('br');
      range?.setStartAfter(img);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(img);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowImageModal(false);
    setSavedRange(null);
  }, [savedRange, setSavedRange]);

  // Expose the method to parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    insertImageIntoEditor
  }), [insertImageIntoEditor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > maxImageSize) {
      alert(`Image size must be less than ${maxImageSize / (1024 * 1024)}MB`);
      return;
    }

    try {
      const imageData = await uploadImage(file);
      insertImageIntoEditor(imageData);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [maxImageSize, uploadImage, insertImageIntoEditor]);

  // Video handling
  const insertYouTubeVideo = useCallback(() => {
    if (!videoUrl.trim()) return;

    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    const embedWrapper = createYouTubeEmbed(videoId);

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(embedWrapper);

      const br = document.createElement('br');
      range?.setStartAfter(embedWrapper);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(embedWrapper);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowVideoModal(false);
    setVideoUrl('');
    setSavedRange(null);
  }, [videoUrl, savedRange, setSavedRange]);

  const insertLink = useCallback(() => {
    if (!linkUrl) return;

    editorRef.current?.focus();
    if (savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    }

    execCommand('createLink', linkUrl);
    setShowLinkModal(false);
    setLinkUrl('');
    setSavedRange(null);
  }, [linkUrl, savedRange, setSavedRange, execCommand]);

  // Drag and drop
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleImageUpload(imageFile);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // File input
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  // Content change
  const handleContentChange = useCallback((e: FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          const selection = window.getSelection();
          if (selection?.rangeCount) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
          }
          setShowLinkModal(true);
          break;
      }
    }
  }, [execCommand, setSavedRange]);

  // Memoized options
  const toolbarButtons = useMemo<ToolbarItem[]>(() => [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    {
      icon: Link,
      action: () => {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          setSavedRange(selection.getRangeAt(0).cloneRange());
        }
        setShowLinkModal(true);
      },
      title: 'Insert Link (Ctrl+K)'
    },
    {
      icon: Image,
      action: () => {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          setSavedRange(selection.getRangeAt(0).cloneRange());
        }
        OpenModal(true,false);
      },
      title: 'Insert Image'
    },
    {
      icon: Video,
      action: () => {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          setSavedRange(selection.getRangeAt(0).cloneRange());
        }
        setShowVideoModal(true);
      },
      title: 'Insert YouTube Video'
    },
  ], [setSavedRange, OpenModal]);

  const headingOptions = useMemo<SelectOption[]>(() => [
    { label: 'Normal', command: 'formatBlock', value: 'div' },
    { label: 'Heading 1', command: 'formatBlock', value: 'h1' },
    { label: 'Heading 2', command: 'formatBlock', value: 'h2' },
    { label: 'Heading 3', command: 'formatBlock', value: 'h3' },
    { label: 'Heading 4', command: 'formatBlock', value: 'h4' },
    { label: 'Heading 5', command: 'formatBlock', value: 'h5' },
    { label: 'Heading 6', command: 'formatBlock', value: 'h6' },
  ], []);

  const fontSizeOptions = useMemo<SelectOption[]>(() => [
    { label: '8px', value: '8px' },
    { label: '10px', value: '10px' },
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '28px', value: '28px' },
    { label: '32px', value: '32px' },
    { label: '36px', value: '36px' },
    { label: '48px', value: '48px' },
    { label: '60px', value: '60px' },
    { label: '72px', value: '72px' },
  ], []);

  const fontFamilyOptions = useMemo<SelectOption[]>(() => [
    { label: 'Default', value: 'inherit' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
    { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
    { label: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Century Gothic', value: '"Century Gothic", CenturyGothic, sans-serif' },
    { label: 'Garamond', value: 'Garamond, serif' },
  ], []);

  return (
    <div className={`max-w-7xl mx-auto rounded-lg ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const option = headingOptions.find(opt => opt.value === e.target.value);
                if (option) execCommand(option.command || "", option.value || "");
              }}
            >
              {headingOptions.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                if (e.target.value) {
                  handleFontFamily(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Font</option>
              {fontFamilyOptions.map((option, index) => (
                <option key={index} value={option.value} style={{ fontFamily: option.value }}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[70px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                if (e.target.value) {
                  handleFontSize(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Size</option>
              {fontSizeOptions.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
              ))}
            </select>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {toolbarButtons.map((button, index) => (
              button.divider ? (
                <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              ) : (
                <button
                  key={index}
                  onClick={() => button.action ? button.action() : (button.command && execCommand(button.command))}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                  title={button.title}
                  type="button"
                >
                  <button.icon size={16} className="text-gray-700 dark:text-gray-300" />
                </button>
              )
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className={`min-h-96 p-4 focus:outline-none text-gray-800 dark:text-gray-200 leading-relaxed ${
              dragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-500' : ''
            }`}
            style={{
              fontSize: '16px',
              lineHeight: '1.6'
            }}
            onInput={handleContentChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onKeyDown={handleKeyDown}
          />

          {!content && (
            <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
              {placeholder}
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 bg-opacity-90 pointer-events-none">
              <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                Drop your image here
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          Words: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} |
          Characters: {content.replace(/<[^>]*>/g, '').length}
        </div>
      </div>

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl('');
        }}
        onInsert={insertLink}
        value={linkUrl}
        onChange={setLinkUrl}
      />

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setVideoUrl('');
        }}
        onInsert={insertYouTubeVideo}
        value={videoUrl}
        onChange={setVideoUrl}
      />

      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
        }}
        onFileSelect={handleFileSelect}
        uploading={uploading}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
      />

      <style jsx global>{`
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        
        [contenteditable] a {
          color: #3B82F6;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1D4ED8;
        }
        
        [contenteditable] img {
          width: 100%;
          max-width: 600px;
          height: auto;
          margin: 10px 0;
          display: block;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        [contenteditable] img:hover {
          opacity: 0.9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        [contenteditable] .youtube-embed-wrapper {
          position: relative;
          width: 100%;
          max-width: 560px;
          margin: 20px auto;
          padding: 0;
          background: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        [contenteditable] .youtube-embed-wrapper:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }

        [contenteditable] .youtube-embed-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 640px) {
          [contenteditable] .youtube-embed-wrapper {
            max-width: 100%;
            margin: 15px 0;
          }
        }
      `}</style>
    </div>
  );
});

WysiwygEditor.displayName = 'WysiwygEditor';

export default WysiwygEditor;