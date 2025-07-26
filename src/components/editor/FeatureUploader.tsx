import { useEffect, useState } from 'react';
import { Upload, X} from 'lucide-react';




export interface FeatureImageUploaderProps {
  UpdateFeatureImage: (image: string | null) => void;
  featuredImage?: string | null;
  title?: string;
  OpenModal: (flag: boolean | false, isFeature: boolean) => void;
}

export const FeatureImageUploader = ({  
  featuredImage, 
  title = 'Featured Image',
  OpenModal, 
}: FeatureImageUploaderProps) => {

  const [imagePreview, setImagePreview] = useState<string | null>(featuredImage || null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  

  

  useEffect(() => {
    if (featuredImage !== null && featuredImage !== '' && featuredImage !== undefined) {
      if (featuredImage !== imagePreview) {
        setImagePreview(featuredImage);
      }
    }
  }, [featuredImage, imagePreview]);

  

  

 

  const removeImage = (): void => {
    setImagePreview(null);
   
  };

  

 
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
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Image'}
        </button>

      
      </div>

      
     

      {imagePreview && (
        <div className="mt-4 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

         
        </div>
      )}

     
    </div>
  );
};