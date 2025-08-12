"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import { Save, Eye, X, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { available_colors } from '@/config/config';
import { FeatureImageUploader } from '@/components/editor/FeatureUploader';
import { Notification } from '@/components/ui/notification/Notification';
import MultiselectDropdown from '@/components/ui/dropdown/MultiselectDropdown';
import ImageUploaderModal from './Gallery/ImageUploaderModal';

import WysiwygEditor from '@/components/editor/WysiwygEditor';

import { ImageData } from '@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal';
import { WysiwygEditorRef } from '@/components/editor';

import Switch from "@/components/form/switch/Switch";


// Type definitions

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface FormData {
  title: string;
  sub_head: string;
  excerpt: string;
  post_content: string;
  short_title?: string | null;
  subtitle?: string | null;
  highlight?: string | null;
  author?: string | null;
  writer_id?: number | null;
  featured_image: string | null;
  caption: string | null;
  categories: number[];
  post_status?: number | 0 | 1; // 0 for draft, 1 for published
  tags: string[];
  lead_news: boolean,
  breaking_news: boolean,
}

export default function CreatePost({ postId: postId }: { postId: string | null | undefined }) {
  const isEditMode = !!postId;
  const [isFeature, setIsFeature] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(isEditMode);
  const [editorContent, setContent] = useState('');
  const editorRef = useRef<WysiwygEditorRef>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    excerpt: '',
    short_title: '',
    sub_head: '',
    subtitle: '',
    highlight: '',
    author: '',
    writer_id: null,
    post_content: '',
    featured_image: '',
    caption: '',
    post_status: 1, // Default to draft
    categories: [],
    tags: [],
    lead_news: false,
    breaking_news: false,

  });

  // Tag-related state
  const [tagInput, setTagInput] = useState<string>('');

  const { news_categories, savePost, getPost, router } = useAuth();

  const all_cat: Category[] = news_categories.map((category: any, index: number) => {
    return {
      id: Number(category.id),
      name: category.name,
      slug: category.slug,
      color: available_colors[index % 10]
    };
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  // Load post data for edit mode
  useEffect(() => {
    const loadPost = async () => {
      if (!isEditMode || !postId) return;

      setIsLoadingPost(true);
      try {
        const response = await getPost(postId);
        const post = response.data;
        setFormData({
          ...formData,
          sub_head: post.sub_head || '',
          title: post.title || '',
          short_title: post.short_title || '',
          subtitle: post.subtitle || '',
          highlight: post.highlight || '',
          author: post.author || '',
          excerpt: post.excerpt || '',
          post_content: post.post_content || '',
          featured_image: post.image || '',
          caption: post.caption || '',
          post_status: post?.post_status === 1 ? 1 : 0,
          categories: post.categories?.map?.((cat: Category) => Number(cat.id)) || [],
          tags: post.tags?.map?.((tag: Tag) => tag.name) || [],
          breaking_news: response.breaking_news,
          lead_news: response.lead_news
        });

        setImagePreview(post.featured_image || '');
      } catch (error) {
        console.error('Error loading post:', error);
        showNotification('Failed to load post data. Please try again.', 'error');

      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [isEditMode, postId, getPost]);

  const UpdateFeatureImage = useCallback((imageData: ImageData): void => {
    setFormData((prev: any) => ({ ...prev, featured_image: imageData.url }));
    setImagePreview(imageData.url);
  }, []);

  const handleCategoryToggle = (categoryIds: number[]): void => {
    setFormData((prev: any) => ({
      ...prev,
      categories: categoryIds
    }));
  };

  const handleExternalImageInsert = (imageData: ImageData): void => {
    // console.log('imageData', imageData);
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

  const handleCategoryChange = (categories: Category[]): void => {
    const categoryIds = categories.map(cat => cat.id);
    handleCategoryToggle(categoryIds);
  };

  // Tag handling functions
  const handleTagAdd = (tagName: string): void => {
    if (tagName.trim() && !formData.tags.includes(tagName.trim())) {
      setFormData((prev: FormData) => ({
        ...prev,
        tags: [...prev.tags, tagName.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string): void => {
    setFormData((prev: FormData) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const OpenModal = (flag: boolean, isFeature: boolean): void => {
    setIsOpen(flag);
    setIsFeature(isFeature);
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

  const handleSwitchChange = (checked: boolean): void => {
    setFormData({ ...formData, post_status: checked ? 1 : 0 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
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
    const currentContent = editorRef.current?.getCurrentContent() || formData.post_content;

    if (!formData.post_content.trim() && !currentContent.trim()) {
      errors.push('Content is required');
    }

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }

    if (!formData.title.trim().length || formData.title.trim().length < 5 || formData.title.trim().length > 250) {
      errors.push('Title need to be between 5 and 250 characters long');
    }

    if (formData.sub_head.trim().length > 250) {
      errors.push('Sub-head can be 250 characters long');
    }

    if (formData.caption && formData.caption.trim().length > 250) {
      errors.push('caption can be 250 characters long');
    }

    if (!formData.excerpt.trim()) {
      errors.push('Excerpt is required');
    }
    if (!currentContent.trim()) {
      errors.push('Content is required');
    }
    if (formData.categories.length === 0) {
      errors.push('Please select at least 1 category');
    }
    if (formData.categories.length > 5) {
      errors.push('Please select maximum 5 categories');
    }
    if (!formData.featured_image) {
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

    setIsLoading(true);
    try {
      const currentContent = editorRef.current?.getCurrentContent();

      const saveData: FormData = {
        title: formData.title,
        sub_head: formData.sub_head,
        short_title: formData.short_title,
        subtitle: formData.subtitle,
        highlight: formData.highlight,
        author: formData.author,
        writer_id: formData.writer_id,
        excerpt: formData.excerpt,
        post_content: currentContent || formData.post_content,
        featured_image: formData.featured_image,
        caption: formData.caption || '',
        categories: formData.categories,
        post_status: formData.post_status,
        tags: formData.tags,
        lead_news: formData.lead_news,
        breaking_news: formData.breaking_news
      };

      if (isEditMode) {
        await savePost({ ...saveData, id: postId });
        showNotification('News article updated successfully!', 'success');
      } else {
        await savePost(saveData);
        showNotification('News article created successfully!', 'success');
      }

      // Redirect after successful save/update
      setTimeout(() => {
        router.push('/posts');
      }, 2000);

    } catch (e) {
      console.log('error', e);
      showNotification(
        `Failed to ${isEditMode ? 'update' : 'save'} article. Please try again.`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      router.push('/posts');
    }
  };

  // Loading state for edit mode
  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const ArticleHeader = ({
    isEditMode,
    isPreview,
    isLoading,
    setIsPreview,
    handleCancel,
    handleSubmit
  }: {
    isEditMode: boolean;
    isPreview: boolean;
    isLoading: boolean;
    setIsPreview: (preview: boolean) => void;
    handleCancel: () => void;
    handleSubmit: () => void;
  }) => {
    return (
      <div className="flex justify-end my-4 items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (isEditMode ? 'Update Article' : 'Save Article')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header with title and action buttons */}
      <ArticleHeader
        isEditMode={isEditMode}
        isPreview={isPreview}
        isLoading={isLoading}
        setIsPreview={setIsPreview}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
      />

      <div className="max-w-7xl mx-auto lg:px-8 py-4">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="space-y-4">
          <div className="space-y-6">
            {/* Sub-Head */}
            <div>
              <label htmlFor="sub_head" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sub Head
              </label>
              <input
                type="text"
                id="sub_head"
                name="sub_head"
                value={formData.sub_head || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter article sub-head..."
              />
            </div>


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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter article title..."
                required
              />
            </div>

            {/* Short title */}
            <div>
              <label htmlFor="short_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short title
              </label>
              <input
                type="text"
                id="short_title"
                name="short_title"
                value={formData.short_title || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Short title for home page..."
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Writer's name
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Writer's name..."
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

          </div>

          {/* WYSIWYG Editor */}

          <div className="mt-6">
            <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Main Content *
            </div>
            <WysiwygEditor
              ref={editorRef}
              OpenModal={OpenModal}
              updatePostContent={setContent}
              postContent={formData.post_content}
            />
          </div>


          {/* highlight */}
          <div>
            <label htmlFor="highlight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highlight
            </label>
            <textarea
              id="highlight"
              name="highlight"
              value={formData.highlight || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Highlight for the article..."
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
                preselected={formData.categories}
              />
            </div>

            {formData.categories.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected categories:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((categoryId: number) => {
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
          <FeatureImageUploader
            featured_image={formData.featured_image}
            OpenModal={OpenModal}
          />

          {/* caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption
            </label>
            <input
              type="text"
              id="caption"
              name="caption"
              value={formData.caption || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Image caption..."
            />
          </div>

          <ImageUploaderModal
            isOpen={isOpen}
            callback={
              isFeature
                ? UpdateFeatureImage
                : (imageData: ImageData) => {
                  // Assuming handleExternalImageInsert needs the main image URL
                  handleExternalImageInsert(imageData);
                }
            }
            OpenModal={OpenModal}
          />
        </div>

        <div className="mt-6 max-w-2xl flex justify-between items-center">
          {/* Publish Btn */}
          <Switch
            label="Publish"
            defaultChecked={formData.post_status === 1}
            onChange={handleSwitchChange}
          />

          {/* Latest Post Btn */}
          <Switch
            label="Latest Post"
            defaultChecked={formData.lead_news}
            onChange={(flag: boolean) => {
              setFormData({ ...formData, lead_news: flag });
            }}
          />

          {/* Breaking News Btn */}
          <Switch
            label="Breaking News "
            defaultChecked={formData.breaking_news}
            onChange={(flag: boolean) => {
              setFormData({ ...formData, breaking_news: flag });
            }}
          />
        </div>



      </div>

      {/* Header with title and action buttons */}
      <ArticleHeader
        isEditMode={isEditMode}
        isPreview={isPreview}
        isLoading={isLoading}
        setIsPreview={setIsPreview}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}