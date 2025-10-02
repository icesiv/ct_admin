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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
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

interface IframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
  width: string;
  height: string;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: string) => void;
}

export const IframeModal = memo<IframeModalProps>(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange,
  width,
  height,
  onWidthChange,
  onHeightChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Embed Content (iframe)</h3>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL here..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input
              type="text"
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              placeholder="auto"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="text"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              placeholder="auto"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p className="mb-2">Dimensions: Use pixels (e.g., 600px), percentages (e.g., 100%), or leave as "auto"</p>
          <p className="font-medium">Supported content:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>YouTube, Vimeo, Dailymotion videos</li>
            <li>Google Maps, OpenStreetMap</li>
            <li>Any embeddable URL</li>
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
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            type="button"
          >
            Insert Embed
          </button>
        </div>
      </div>
    </div>
  );
});

IframeModal.displayName = 'IframeModal';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: () => void;
  value: string;
  onChange: (value: string) => void;
}

export const EmbedCodeModal = memo<EmbedCodeModalProps>(({
  isOpen,
  onClose,
  onInsert,
  value,
  onChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99999">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your embed code here..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 min-h-[150px] font-mono text-sm"
          autoFocus
        />
        <div className="text-sm text-gray-500 mb-4">
          Supported embed codes:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Twitter/X posts</li>
            <li>Instagram posts</li>
            <li>CodePen snippets</li>
            <li>TikTok videos</li>
            <li>Any HTML embed code</li>
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            type="button"
          >
            Insert Code
          </button>
        </div>
      </div>
    </div>
  );
});

EmbedCodeModal.displayName = 'EmbedCodeModal';