"use client";
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Save, X, Plus, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FeatureImageUploader } from '@/components/editor/FeatureUploader';
import MultiselectDropdown from '@/components/ui/dropdown/MultiselectDropdown';
import ImageUploaderModal from './Gallery/ImageUploaderModal';
import LocationSelector from './LocationSelector';

import WysiwygEditor from '@/components/editor/WysiwygEditor';

import { ImageData } from '@/app/(admin)/(others-pages)/posts/create/component/Gallery/ImageUploaderModal';
import { WysiwygEditorRef } from '@/components/editor';

import Switch from "@/components/form/switch/Switch";

import { useToast } from "@/components/ToastProvider";

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

interface District {
  id: number;
  name: string;
}

interface Author {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  sub_head: string;
  excerpt: string;
  post_content: string;
  short_title?: string | null;
  subtitle?: string | null;
  highlight?: string | null;
  author: string | null;
  writer_id?: number | null;
  featured_image: string | null;
  caption: string | null;
  categories: number[];
  districts: number[]; // Added districts
  post_status?: number | 0 | 1; // 0 for draft, 1 for published
  tags: string[];
  lead_news: boolean,
  breaking_news: boolean,
}

export default function CreatePost({ postId: postId }: { postId: string | null | undefined }) {
  const isEditMode = !!postId;
  const [isFeature, setIsFeature] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(isEditMode);
  const [editorContent, setContent] = useState('');
  const editorRef = useRef<WysiwygEditorRef>(null);


  const { addToast } = useToast();

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
    districts: [], // Initial empty array
    tags: [],
    lead_news: false,
    breaking_news: false,

  });

  // Tag-related state
  const [tagInput, setTagInput] = useState<string>('');

  const { news_categories, savePost, getPost, router, authFetch } = useAuth();

  const all_cat: Category[] = news_categories.map((category: any, index: number) => {
    return {
      id: Number(category.id),
      name: category.name,
      slug: category.slug,
    };
  });

  // Author State & Logic
  const [authors, setAuthors] = useState<Author[]>([]);
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        // Use BASE_URL from config or context if possible, here using import
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'}admin/authors/list`);
        if (response.ok) {
          const data = await response.json();
          setAuthors(data.data || []);
        }
      } catch (e) { console.error(e); }
    };
    fetchAuthors();
  }, []);

  const handleAuthorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedAuthor = authors.find(a => a.id === selectedId);

    if (selectedAuthor) {
      setFormData(prev => ({
        ...prev,
        writer_id: selectedAuthor.id,
        // author: selectedAuthor.name // User requested to keep existing writer name
      }));
    } else {
      setFormData(prev => ({ ...prev, writer_id: null }));
    }
  };

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
          districts: post.districts?.map?.((dist: District) => Number(dist.id)) || [], // Load districts
          tags: post.tags?.map?.((tag: Tag) => tag.name) || [],
          breaking_news: response.breaking_news,
          lead_news: response.lead_news,
          writer_id: post.writer_id || null // Load writer_id
        });

        // setImagePreview(post.featured_image || '');
      } catch (error) {
        console.error('Error loading post:', error);
        addToast("Failed to load post data. Please try again!", "error");

      } finally {
        setIsLoadingPost(false);
      }
    };

    loadPost();
  }, [isEditMode, postId, getPost]);

  const UpdateFeatureImage = useCallback((imageData: ImageData): void => {
    setFormData((prev: any) => ({ ...prev, featured_image: imageData.url }));
    // setImagePreview(imageData.url);
  }, []);

  const handleCategoryToggle = (categoryIds: number[]): void => {
    setFormData((prev: any) => ({
      ...prev,
      categories: categoryIds
    }));
  };

  const handleDistrictChange = (districtIds: number[]): void => {
    setFormData((prev: any) => ({
      ...prev,
      districts: districtIds
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

  const validateForm = (): string[] => {
    const errors: string[] = [];
    const currentContent = editorRef.current?.getCurrentContent() || formData.post_content;

    if (!formData.post_content.trim() && !currentContent.trim()) {
      errors.push('Content is required');
    }

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }

    if (!formData.author || !formData.author.trim()) {
      errors.push('Writer\'s name is required');
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

  const handleSubmit = async (shouldCreateNew: boolean = false): Promise<void> => {
    const errors = validateForm();

    if (errors.length > 0) {
      addToast(errors.join(',\n'), 'error');
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
        districts: formData.districts, // Save districts
        post_status: formData.post_status,
        tags: formData.tags,
        lead_news: formData.lead_news,
        breaking_news: formData.breaking_news
      };

      if (isEditMode) {
        await savePost({ ...saveData, id: postId });
        addToast("Article saved successfully!", "success");

      } else {
        await savePost(saveData);
        addToast("Article created successfully!", "success");

      }

      if (shouldCreateNew) {
        if (isEditMode) {
          // If editing, redirect to create new page
          router.push('/posts/create');
        } else {
          // If already creating, just reset the form
          setFormData({
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
            post_status: 1,
            categories: [],
            districts: [],
            tags: [],
            lead_news: false,
            breaking_news: false,
          });
          setTagInput('');
          setContent(''); // Clear editor content state if used
          // Note: editorRef might need specific clearing depending on implementation, 
          // but normally updating key or remounting works. 
          // Since we reset state, scrolling top is helpful.
          window.scrollTo({ top: 0, behavior: 'smooth' });
          addToast("Ready for new article!", "info");
        }
      } else {
        // Redirect after successful save/update
        setTimeout(() => {
          router.push('/posts');
        }, 2000);
      }

    } catch (e: any) {
      console.log('error', e);
      addToast(
        e.message || `Failed to ${isEditMode ? 'update' : 'save'} article. Please try again.`,
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
    isLoading,
    handleSubmit,
    handleSaveAndCreateNew
  }: {
    isEditMode: boolean;
    isLoading: boolean;
    handleCancel: () => void;
    handleSubmit: () => void;
    handleSaveAndCreateNew: () => void;
  }) => {
    return (
      <div className="flex justify-end my-4 items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSaveAndCreateNew}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save & Create New
          </button>

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
      <ArticleHeader
        isEditMode={isEditMode}
        isLoading={isLoading}
        handleCancel={handleCancel}
        handleSubmit={() => handleSubmit(false)}
        handleSaveAndCreateNew={() => handleSubmit(true)}
      />

      <div className="grid grid-cols-5 gap-8">
        {/* Left */}
        <div className="col-span-5 order-1 md:order-none md:col-span-3 space-y-6">
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




          {/* Author Selection */}
          <div>
            <label htmlFor="writer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Author (Optional)
            </label>
            <select
              id="writer_id"
              name="writer_id"
              value={formData.writer_id || ''}
              onChange={handleAuthorSelect}
              className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Select an Author --</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>

            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Writer's name *
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
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Brief description of the article..."
              required
            />
          </div>
        </div>

        {/* Right */}
        <div className="col-span-5 order-3 md:order-none md:col-span-2 md:col-start-4 space-y-6">
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
              rows={7}
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
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tags
            </label>

            {/* Tag input */}
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
              <div className="flex gap-2">
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">({formData.tags.length}/10)</p>
              </div>
            )}
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="col-span-5 order-2 md:order-none md:row-start-2">
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
      </div>

      <div className="container mx-auto mt-6 grid md:grid-cols-3 gap-6">
        {/* Feature Image Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm w-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Feature Image</h3>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <FeatureImageUploader
              featured_image={formData.featured_image}
              OpenModal={OpenModal}
            />

            {/* caption */}
            <div className='w-full'>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <input
                type="text"
                id="caption"
                name="caption"
                value={formData.caption || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Image caption..."
              />
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div className="md:col-span-2">
          <LocationSelector
            selectedDistrictIds={formData.districts}
            onChange={handleDistrictChange}
          />

          {/* Publish, Latest Post, Breaking News Switches */}
          <div className="mt-6 px-24 md:px-4 py-3 gap-y-4 flex flex-col md:flex-row justify-between items-end border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400">
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

      </div>



      <ImageUploaderModal
        isOpen={isOpen}
        callback={
          isFeature
            ? UpdateFeatureImage
            : (imageData: ImageData) => {
              handleExternalImageInsert(imageData);
            }
        }
        OpenModal={OpenModal}
      />

      {/* Header with title and action buttons */}
      <ArticleHeader
        isEditMode={isEditMode}
        isLoading={isLoading}
        handleCancel={handleCancel}
        handleSubmit={() => handleSubmit(false)}
        handleSaveAndCreateNew={() => handleSubmit(true)}
      />
    </div>
  );
}