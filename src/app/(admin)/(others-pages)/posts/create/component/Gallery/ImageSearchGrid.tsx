import React, { useState,ChangeEvent } from 'react';
import {  Upload, Search,Trash2 } from 'lucide-react';
import { BASE_URL } from '@/config/config';

// Type definitions
interface ImageData {
  id: number;
  url: string;
  tags: string[];
  name: string;
  fileName?: string;
}

interface ImageSearchGrid {
  initialImages?: ImageData[];
  onImagesChange?: (images: ImageData[]) => void;
}

const ImageSearchGrid: React.FC<ImageSearchGrid> = ({ 
  initialImages = [],
  onImagesChange
}) => {
  const [images, setImages] = useState<ImageData[]>([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      tags: ['nature', 'mountain', 'landscape'],
      name: 'Mountain View'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
      tags: ['forest', 'nature', 'trees'],
      name: 'Forest Path'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      tags: ['ocean', 'beach', 'sunset'],
      name: 'Ocean Sunset'
    },
    ...initialImages
  ]);
  const [searchTerm, setSearchTerm] = useState<string>('');
   
  

 

  
  

  

 
  // Filter images based on search term
  const filteredImages: ImageData[] = images.filter(image =>
    image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

 

 
 

  const deleteImage = (imageId: number): void => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  

  

  return (
    <>
      <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Search Section */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search images by tags or filename..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Search images"
                      />
                    </div>
                  </div>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map(image => (
                      <div key={image.id} className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => deleteImage(image.id)}
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
                  </div>

                  {filteredImages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        <Upload size={48} className="mx-auto" />
                      </div>
                      <p className="text-gray-600 text-lg">
                        {searchTerm ? 'No images found matching your search' : 'No images uploaded yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
    </>
  );
};

export default ImageSearchGrid;