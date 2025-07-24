import React, { ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';

interface SearchPanelProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  searchLoading?: boolean;
  onClearSearch?: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ 
  searchTerm, 
  onSearchChange, 
  searchLoading = false,
  onClearSearch 
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search images by title or tags..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search images"
        />
        
        {/* Loading Spinner */}
        {searchLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        
        {/* Clear Search Button */}
        {searchTerm && !searchLoading && (
          <button
            onClick={() => {
              onSearchChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
              onClearSearch?.();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>
      
      {/* Search Info */}
      {searchTerm && (
        <div className="mt-2 text-xs text-gray-500">
          {searchLoading ? (
            <span className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
              Searching for "{searchTerm}"...
            </span>
          ) : (
            <span>Search results for "{searchTerm}"</span>
          )}
        </div>
      )}
    </div>
  );
};
