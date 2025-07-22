"use client";

import { useCallback, useState } from 'react';
import { Save, Eye, X, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { available_colors } from '@/config/config';
import WysiwygEditor from '@/components/editor/WysiwygEditor';
import { FeatureImageUploader } from '@/components/editor/FeatureUploader';
import { Notification } from '@/components/ui/notification/Notification';
import MultiselectDropdown from '@/components/ui/dropdown/MultiselectDropdown';

// Type definitions
interface Category {
  id: number;
  name: string;
  color?: string;
}

interface FormData {
  title: string;
  excerpt: string;
  postContent: string;
  featuredImage: File | string | null;
  categories: number[];
  tags: string[];
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface SavePostData {
  title: string;
  excerpt: string;
  post_content: string;
  featured_image: File | string | null;
  categories: number[];
  tags: string[];
}

export default function CreatePost() {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    excerpt: '',
    postContent: '    ',
    featuredImage: null,
    categories: [],
    tags: []
  });

  // Tag-related state
  const [tagInput, setTagInput] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Breaking News', 'Politics', 'Technology', 'Sports', 'Entertainment',
    'Business', 'Health', 'Science', 'Travel', 'Education'
  ]);

  const { news_categories, savePost } = useAuth();
  const all_cat: Category[] = news_categories.map((category: any, index: number) => {
    return {
      id: Number(category.id), // Ensure id is a number
      name: category.name,
      color: available_colors[index % 10]
    };
  });

  const UpdatePostContent = useCallback((value: string): void => {
    setFormData({ ...formData, postContent: value });
  }, [formData]);

  const UpdateFeatureImage = useCallback((value: File | string | null): void => {
    console.log('value', value);
    setFormData({ ...formData, featuredImage: value });
  }, [formData]);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  const handleCategoryToggle = (categoryIds: number[]): void => {
    setFormData(prev => ({
      ...prev,
      categories: categoryIds
    }));
  };

  // New function to handle Category objects from MultiselectDropdown
  const handleCategoryChange = (categories: Category[]): void => {
    const categoryIds = categories.map(cat => cat.id);
    handleCategoryToggle(categoryIds);
  };

  // Tag handling functions
  const handleTagAdd = (tagName: string): void => {
    if (tagName.trim() && !formData.tags.includes(tagName.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleTagAdd(tagInput);
        setTagInput('');
      }
    }
  };

  const handleTagInputSubmit = (): void => {
    if (tagInput.trim()) {
      handleTagAdd(tagInput);
      setTagInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message: string, type: NotificationState['type']): void => {
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
    if (formData.tags.length > 10) {
      errors.push('Please select maximum 10 tags');
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
      const saveData: SavePostData = {
        title: formData.title,
        excerpt: formData.excerpt,
        post_content: formData.postContent,
        featured_image: formData.featuredImage,
        categories: formData.categories,
        tags: formData.tags,
      };

      await savePost(saveData);
      showNotification('News article saved successfully!', 'success');
    } catch (e) {
      console.log('error', e);
      showNotification('Failed to save article. Please try again.', 'error');
    }
  };

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

  const renderPreview = () => {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
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

        {/* Tags in Preview */}
        {formData.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

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
    <div>
      <div className="flex justify-end items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Article
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Brief description of the article..."
                    required
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Categories *
                  </label>
                  <div className="block">
                    <MultiselectDropdown
                      resetDropSelected={handleCategoryChange}
                      news_categories={all_cat}
                      handleCategoryChange={handleCategoryChange}
                    />
                  </div>

                  {formData.categories.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map(categoryId => {
                          const category = all_cat.find(cat => cat.id === categoryId);
                          return category ? (
                            <span
                              key={categoryId}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
                            >
                              {category.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tags
                  </label>

                  {/* Tag Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Type a tag and press Enter or comma..."
                    />
                    <button
                      type="button"
                      onClick={handleTagInputSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Popular Tags */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.filter(tag => !formData.tags.includes(tag)).map((tag: string) => (
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
                        {formData.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
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
                <FeatureImageUploader UpdateFeatureImage={UpdateFeatureImage} />
              </div>
           

            {/* WYSIWYG Editor */}
            <div className="shadow rounded-lg">
              <WysiwygEditor updatePostContent={UpdatePostContent} postContent={formData.postContent} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}