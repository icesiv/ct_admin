import React, { memo, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
}

export const LinkModal = memo<LinkModalProps>(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange
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

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
}

export const VideoModal = memo<VideoModalProps>(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange
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

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ImageModal = memo<ImageModalProps>(({
  isOpen,
  onClose,
  onFileSelect,
  uploading,
  uploadProgress,
  fileInputRef
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