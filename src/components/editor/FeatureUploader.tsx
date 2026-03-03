import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';


export interface FeatureImageUploaderProps {
  featured_image?: string | null;
  title?: string;
  OpenModal: (flag: boolean | false, isFeature: boolean) => void;
  onClear?: () => void;
}

export const FeatureImageUploader = ({
  featured_image,
  title = 'Featured Image *',
  OpenModal,
  onClear,
}: FeatureImageUploaderProps) => {

  const [imagePreview, setImagePreview] = useState<string | null>(featured_image || null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');


  useEffect(() => {
    if (featured_image !== undefined) {
      if (featured_image !== imagePreview) {
        setImagePreview(featured_image || null);
      }
    }
  }, [featured_image, imagePreview]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-2">
        {title}
      </label>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => {
            OpenModal(true, true);
          }}
          disabled={uploadStatus === 'uploading'}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>


      {imagePreview && (
        <div className="mt-4 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-80 h-48 rounded-lg border border-gray-200 object-cover"
          />
          {onClear && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                onClear();
              }}
              className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow-sm transition-colors border border-red-200"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};