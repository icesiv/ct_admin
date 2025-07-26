import React from 'react';
import { Upload, Trash2, RotateCcw } from 'lucide-react';

interface ImageData {
  id: number;
  url: string;
  tags: string[];
  name: string;
  fileName?: string;
}

interface ImagesGridProps {
  images: ImageData[];
  searchTerm: string;
  onDeleteImage: (imageId: number) => void;
  loadingMore?: boolean;
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  totalImages?: number;
  currentPage?: number;
  isSearchMode?: boolean;
  callback: (url: string) => void;
  OpenModal: (flag: boolean) => void;
}

export const ImagesGrid: React.FC<ImagesGridProps> = ({ 
  images, 
  searchTerm, 
  onDeleteImage,
  loadingMore = false,
  hasMorePages = false,
  onLoadMore,
  totalImages = 0,
  currentPage = 1,
  isSearchMode = false,
  callback,
  OpenModal
}) => {

  return (
    <div>
      {/* Images Count Info */}
      {totalImages > 0 && (
        <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
          <span>
            {isSearchMode ? (
              <>Showing {images.length} search results</>
            ) : (
              <>Showing {images.length} of {totalImages} images</>
            )}
          </span>
          {currentPage > 1 && !isSearchMode && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Page {currentPage}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(image => (
          <div key={image.id} className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-square overflow-hidden">
              <a href='#' onClick={(e)=>{
                e.preventDefault();
                callback(image);
                OpenModal(false);
              }}>
                <img src={image.url} alt={image.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              </a>
            </div>
            
            {/* Delete Button */}
            <button
              onClick={() => onDeleteImage(image.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
              type="button"
              aria-label={`Delete ${image.name}`}
            >
              <Trash2 size={14} />
            </button>

            {/* Image Info */}
            <div className="p-3">
              <h4 className="font-medium text-gray-800 truncate mb-2">
                {image.name}
              </h4>
              <div className="flex flex-wrap gap-1">
                {image.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-2">
              <Upload size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">
              {searchTerm ? `No images found for "${searchTerm}"` : 'No images uploaded yet'}
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Try different keywords or check your spelling
              </p>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMorePages && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            type="button"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Loading more...
              </>
            ) : (
              <>
                <RotateCcw size={16} />
                {isSearchMode ? 'Load More Search Results' : 'Load More Images'}
              </>
            )}
          </button>
        </div>
      )}

      {/* End State Messages */}
      {!hasMorePages && totalImages > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4 inline-block">
            {isSearchMode ? (
              <>🔍 End of search results for "{searchTerm}" - {totalImages} images found</>
            ) : (
              <>🎉 You've reached the end! All {totalImages} images loaded.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};