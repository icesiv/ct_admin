import { Metadata } from "next";
import React from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Camera, Image as ImageIcon, Calendar } from "lucide-react";

// Set the metadata for the page for SEO and browser tab information.
export const metadata: Metadata = {
  title: "Photo Galleries | CT Admin",
  description: "Browse all photo galleries.",
};

// Mock data for the photo galleries. In a real application, you would fetch this data from an API.
const galleries = [
  {
    id: 1,
    title: "Summer Trip to the Mountains",
    imageCount: 45,
    date: "2024-08-15",
    coverImage: "https://placehold.co/600x400/3498db/ffffff?text=Mountains",
  },
  {
    id: 2,
    title: "Urban Exploration: City Lights",
    imageCount: 72,
    date: "2024-07-22",
    coverImage: "https://placehold.co/600x400/9b59b6/ffffff?text=City+Lights",
  },
  {
    id: 3,
    title: "Serene Beach Sunsets",
    imageCount: 30,
    date: "2024-06-30",
    coverImage: "https://placehold.co/600x400/e67e22/ffffff?text=Sunsets",
  },
  {
    id: 4,
    title: "Forest Adventures",
    imageCount: 88,
    date: "2024-05-10",
    coverImage: "https://placehold.co/600x400/2ecc71/ffffff?text=Forest",
  },
  {
    id: 5,
    title: "Architectural Wonders",
    imageCount: 110,
    date: "2024-04-18",
    coverImage: "https://placehold.co/600x400/1abc9c/ffffff?text=Architecture",
  },
  {
    id: 6,
    title: "Minimalist Photography",
    imageCount: 25,
    date: "2024-03-05",
    coverImage: "https://placehold.co/600x400/f1c40f/ffffff?text=Minimalist",
  },
];

// The main component for displaying the list of photo galleries.
export default function PhotoGalleryPage() {
  return (
    <div>
      {/* Breadcrumb for easy navigation */}
      <PageBreadcrumb pageTitle="Photo Galleries" />

      {/* Main content area */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 py-7 dark:border-gray-800 dark:bg-gray-900/50 xl:px-10 xl:py-12 transition-colors duration-300">
        <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">All Galleries</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                <Camera size={18} />
                <span>Create New</span>
            </button>
        </div>

        {/* Grid layout for the galleries */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gallery Cover Image */}
              <div className="relative h-56 w-full">
                <Image
                  src={gallery.coverImage}
                  alt={`Cover image for ${gallery.title}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Gallery Information */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate" title={gallery.title}>
                  {gallery.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span>{gallery.imageCount} Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(gallery.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* View Gallery Overlay */}
              <a href="#" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-4 py-2 border-2 border-white text-white rounded-md font-semibold">
                  View Gallery
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
