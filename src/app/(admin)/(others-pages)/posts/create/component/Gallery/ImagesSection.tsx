
import React, { ChangeEvent } from 'react';
import { SearchPanel } from './SearchPanel';
import { ImagesGrid } from './ImagesGrid';
import { ImageData } from './ImageUploaderModal';




interface ImagesSectionProps {
  images: ImageData[];
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (imageId: number) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  totalImages?: number;
  currentPage?: number;
  callback?: (imageData: ImageData) => void;
  OpenModal: (flag: boolean, isFeature: boolean) => void;
}

export const ImagesSection: React.FC<ImagesSectionProps> = ({ 
  images, 
  searchTerm, 
  onSearchChange, 
  onDeleteImage,
  loading = false,
  loadingMore = false,
  hasMorePages = false,
  onLoadMore,
  totalImages = 0,
  currentPage = 1,
  callback,
  OpenModal
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        {/* Search Section */}
        <SearchPanel searchTerm={searchTerm} onSearchChange={onSearchChange} />

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading images...</p>
            </div>
          </div>
        ) : (
          /* Images Grid */
          <ImagesGrid 
            images={images} 
            searchTerm={searchTerm} 
            onDeleteImage={onDeleteImage}
            loadingMore={loadingMore}
            hasMorePages={hasMorePages}
            onLoadMore={onLoadMore}
            totalImages={totalImages}
            currentPage={currentPage}
            callback={callback}
            OpenModal={OpenModal}
          />
    
        )}
      </div>
    </div>
  );
};
