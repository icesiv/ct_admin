"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Save, Eye, Trash2, Plus, X } from 'lucide-react';

import { useRouter } from 'next/navigation';
//import WysiwygEditor from '@/components/editor/WysiwygEditor';
import { useAuth } from '@/context/AuthContext';
import { available_colors, BASE_URL } from '@/config/config';
import { FeatureImageUploader } from '@/components/editor/FeatureUploader';
import { Notification } from '@/components/ui/notification/Notification';
import MultiselectDropdown from '@/components/ui/dropdown/MultiselectDropdown';
import WysiwygEditor, { WysiwygEditorRef, ImageData } from '@/components/editor/WysiwygEditor';
import ImageUploaderModal from '../../../create/component/Gallery/ImageUploaderModal';
// Type definitions
interface Category {
  id: number;
  name: string;
  color?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface NewsPost {
  id: number;
  title: string;
  excerpt: string;
  post_content: string;
  featured_image: string | null;
  categories: Category[];
  tags: Tag[];
}

interface FormData {
  id: number | null;
  title: string;
  excerpt: string;
  postContent: string;
  featuredImage: string | null;
  categories: number[];
  tags: string[];
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NewsScreenEditProps {
  post_id: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export const NewsScreenEdit: React.FC<NewsScreenEditProps> = ({ post_id }) => {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isFeature, setIsFeature] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: null,
    title: '',
    excerpt: '',
    postContent: '',
    featuredImage: null,
    categories: [],
    tags: []
  });

  const [tagInput, setTagInput] = useState<string>('');
  const [availableTags] = useState<string[]>([
    'Breaking News', 'Politics', 'Technology', 'Sports', 'Entertainment',
    'Business', 'Health', 'Science', 'Travel', 'Education'
  ]);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  const editorRef = useRef<WysiwygEditorRef>(null);


  const handleExternalImageInsert = (imageData: ImageData) => {
   
    if (editorRef.current) {
     
      editorRef.current.insertImageIntoEditor({
        file_url: imageData.url,
        width: imageData.dimensions.width,
        height: imageData.dimensions.height,
        thumb: imageData.thumbnails[0].file_url
      });
    }
    setIsOpen(false);
  };

  const fetchNewsDetail = useCallback(async (id: number): Promise<ApiResponse<NewsPost> | null> => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BASE_URL}admin/posts/view/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const response: ApiResponse<NewsPost> = await res.json();
      setFormData(prev => ({
        ...prev,
        id: response.data.id,
        title: response.data.title,
        excerpt: response.data.excerpt,
        postContent: response.data.post_content,
        featuredImage: response.data.featured_image,
        categories: response.data.categories.map((cat: Category) => Number(cat.id)), // Fixed line
        tags: response.data.tags.map((tag: Tag) => tag.name)
      }));

      // Set image preview if featured image exists
      if (response.data.featured_image) {
        setImagePreview(response.data.featured_image);
      }

      return response;
    } catch (error) {
      console.error('Error fetching news detail:', error);
      return null;
    }
  }, []);
   const OpenModal = (flag: boolean, isFeature: boolean): void => {
    setIsOpen(flag);
    setIsFeature(isFeature);
  };
 
  const deletePost = async (id: number): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${BASE_URL}admin/posts/remove/news`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    });

    if (!res.ok) {
      throw new Error('Failed to delete post');
    }

    return await res.json();
  };

  useEffect(() => {
    fetchNewsDetail(post_id);
  }, [post_id, fetchNewsDetail]);

  const { news_categories, savePost } = useAuth();

  const all_cat: Category[] = news_categories.map((category: any, index: number) => ({
    ...category,
    id: Number(category.id), // Ensure consistent number type
    color: available_colors[index % 10]
  }));

  const UpdatePostContent = useCallback((value: string) => {
    console.log('v', value);
    setFormData(prev => ({ ...prev, postContent: value }));
  }, []);

  // const UpdateFeatureImage = useCallback((value: string | null) => {
  //   console.log('value', value);
  //   if (value !== null && value !== undefined) {
  //     setFormData(prev => ({ ...prev, featuredImage: value }));
  //     setImagePreview(value);
  //   }
  // }, []);

   const UpdateFeatureImage = useCallback((imageData: ImageData): void => {
      setFormData({ ...formData, featuredImage: imageData.url });
      setImagePreview(imageData.url);
    }, [formData]);

  const handleCategoryToggle = (categoryIds: Category[]) => {
    setFormData(prev => ({
      ...prev,
      categories: categoryIds.map(cat => Number(cat.id)) // Ensure it's a number
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagAdd = (tagName: string) => {
    if (tagName.trim() && !formData.tags.includes(tagName.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleTagAdd(tagInput);
        setTagInput('');
      }
    }
  };

  const handleTagInputSubmit = () => {
    if (tagInput.trim()) {
      handleTagAdd(tagInput);
      setTagInput('');
    }
  };

  const showNotification = (message: string, type: NotificationState['type']) => {
    setNotification({ message, type });
    if (type === 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    if (!formData.excerpt.trim()) {
      errors.push('Excerpt is required');
    }
    if (!formData.postContent.trim()) {
      errors.push('Content is required');
    }
    if (formData.categories.length === 0) {
      errors.push('Please select at least 1 category');
    }
    if (formData.categories.length > 5) {
      errors.push('Please select maximum 5 categories');
    }
    if (formData.featuredImage === null || formData.featuredImage === undefined) {
      errors.push('Please Add Feature Image');
    }

    return errors;
  };

  const handleSubmit = async (): Promise<void> => {
    const errors = validateForm();

    if (errors.length > 0) {
      showNotification(errors.join(', '), 'error');
      return;
    }

    try {
      await savePost({
        id: formData.id,
        title: formData.title,
        excerpt: formData.excerpt,
        post_content: formData.postContent,
        featured_image: formData.featuredImage,
        categories: formData.categories,
        tags: formData.tags,
      });
      showNotification('News article saved successfully!', 'success');
    } catch (e) {
      console.log('error', e);
      showNotification('Failed to save article. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;

    setIsDeleting(true);
    try {
      await deletePost(formData.id);
      router.push('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Failed to delete post. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const renderPreview = () => {
    const processContent = (content: string): string => {
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/, '<ul>$1</ul>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
        .replace(/\n/g, '<br />');
    };

    return (
      <div className="max-w-4xl mx-auto p-6 ">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Featured"
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        {/* Categories */}
        {formData.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.categories.map(categoryId => {
              const category = all_cat.find(cat => cat.id === categoryId);
              return category ? (
                <span
                  key={categoryId}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}
                >
                  {category.name}
                </span>
              ) : null;
            })}
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {formData.title || 'Article Title'}
        </h1>
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          {formData.excerpt || 'Article excerpt will appear here...'}
        </p>
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: processContent(formData.postContent || 'Article content will appear here...')
          }}
        />
      </div>
    );
  };

  return (
  <div className=" text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex justify-end items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting || !formData.id}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-red-500 dark:focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-8 py-4">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        {isPreview ? (
          renderPreview()
        ) : (
          <div className="space-y-4">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter article title..."
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Brief description of the article..."
                  required
                />
              </div>

              {/* Categories */}
              <div>
                                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select one or more categories *

                </label>

                <MultiselectDropdown
                  preselected={formData.categories}
                  resetDropSelected={handleCategoryToggle}
                  news_categories={all_cat}
                  handleCategoryChange={handleCategoryToggle}
                // totalNews={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tags
                </label>

                {/* Tag Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Type a tag and press Enter or comma..."
                  />
                  <button
                    type="button"
                    onClick={handleTagInputSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular Tags */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagAdd(tag)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected tags ({formData.tags.length}/10):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Tags help categorize and make your content more discoverable. Press Enter or comma to add multiple tags.
                </p>
              </div>
              {/* Featured Image */}
              <FeatureImageUploader 
                  featuredImage={formData.featuredImage} 
                  UpdateFeatureImage={UpdateFeatureImage} 
                  OpenModal={OpenModal}
                />
            </div>

            {/* WYSIWYG Editor */}
            <div className="shadow rounded-lg bg-white dark:bg-gray-800">
              <WysiwygEditor ref={editorRef} OpenModal={OpenModal} updatePostContent={UpdatePostContent} postContent={formData.postContent} />
               <ImageUploaderModal isOpen={isOpen} callback={ isFeature ? UpdateFeatureImage : handleExternalImageInsert} OpenModal={OpenModal}/> 
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#000000aa] dark:bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-999999">
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg text-gray-600 dark:text-gray-200">Are you sure you want to delete?</h2>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                {formData.title}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}