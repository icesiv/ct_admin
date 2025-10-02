'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent
} from 'react';

import { WysiwygEditorProps, WysiwygEditorRef, ImageData } from './types';
import { useSelection, useImageUpload } from './hooks';
import { extractYouTubeVideoId, createYouTubeEmbed, fixImageUrls } from './utils';
// import { createPasteHandler } from './pasteFilter';
import { Toolbar } from './Toolbar';
import { LinkModal, VideoModal, ImageModal, IframeModal, EmbedCodeModal } from './Modals';
import { EditorStyles } from './EditorStyles';

const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(({
  updatePostContent,
  postContent = null,
  baseUrl = 'https://campustimes.press',
  maxImageSize = 10 * 1024 * 1024, // 10MB
  placeholder = 'Start writing your content here...',
  className = '',
  OpenModal,
  pasteFilterOptions = {
    allowHtml: true,
    allowBasicFormatting: true,
    blockCodePatterns: true,
    onBlockedPaste: (content, type) => {
      alert(`Pasting ${type} code is not allowed. Please paste plain text only.`);
    }
  }
}, ref) => {
  const [content, setContent] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [showIframeModal, setShowIframeModal] = useState<boolean>(false);
  const [iframeCode, setIframeCode] = useState<string>('');
  const [iframeWidth, setIframeWidth] = useState<string>('auto');
  const [iframeHeight, setIframeHeight] = useState<string>('auto');
  const [showEmbedCodeModal, setShowEmbedCodeModal] = useState<boolean>(false);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedText, savedRange, setSavedRange, handleTextSelection } = useSelection();
  const { uploading, uploadProgress, uploadImage } = useImageUpload(baseUrl);

  // Initialize content - FIXED
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      // Use postContent or empty string if null/undefined
      const initialContent = postContent || '';
      const fixedContent = fixImageUrls(initialContent);
      editorRef.current.innerHTML = fixedContent;
      setContent(fixedContent);
      setIsInitialized(true);
    }
  }, [postContent, isInitialized]);

  // Update parent component - IMPROVED
  useEffect(() => {
    // Only update parent if initialized and content has actually changed
    if (isInitialized && updatePostContent) {
      updatePostContent(content);
    }
  }, [content, updatePostContent, isInitialized]);

  // Command execution
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value ?? "");
    editorRef.current?.focus();
  }, []);

  // Font handling
  const handleFontFamily = useCallback((fontFamily: string) => {
    editorRef.current?.focus();
    const selection = window.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontFamily = fontFamily;

        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
          if (editorRef.current) setContent(editorRef.current.innerHTML);
        } catch (error) {
          execCommand('fontName', fontFamily);
        }
      } else {
        execCommand('fontName', fontFamily);
      }
    }
  }, [execCommand]);

  const handleFontSize = useCallback((size: string) => {
    editorRef.current?.focus();
    const selection = window.getSelection();

    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = size;

        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          selection.removeAllRanges();
          if (editorRef.current) setContent(editorRef.current.innerHTML);
        } catch (error) {
          execCommand('fontSize', '3');
        }
      } else {
        execCommand('fontSize', '3');
      }
    }
  }, [execCommand]);

  // Image handling - This is the method that will be exposed
  const insertImageIntoEditor = useCallback((imageData: ImageData) => {
    console.log('Hola', imageData);
    const img = document.createElement('img');
    img.src = imageData.file_url;
    img.alt = 'Uploaded image';

    if (imageData.width && imageData.height) {
      img.setAttribute('data-width', imageData.width.toString());
      img.setAttribute('data-height', imageData.height.toString());
    }

    if (imageData.thumb) {
      img.setAttribute('data-thumb', imageData.thumb);
    }

    Object.assign(img.style, {
      width: '100%',
      maxWidth: '600px',
      height: 'auto',
      margin: '10px 0',
      display: 'block',
      borderRadius: '4px'
    });

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(img);

      const br = document.createElement('br');
      range?.setStartAfter(img);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(img);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowImageModal(false);
    setSavedRange(null);
  }, [savedRange, setSavedRange]);

  // Expose methods to parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    insertImageIntoEditor,
    getCurrentContent: () => content
  }), [insertImageIntoEditor, content]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > maxImageSize) {
      alert(`Image size must be less than ${maxImageSize / (1024 * 1024)}MB`);
      return;
    }

    try {
      const imageData = await uploadImage(file);
      insertImageIntoEditor(imageData);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [maxImageSize, uploadImage, insertImageIntoEditor]);

  // Video handling
  const insertYouTubeVideo = useCallback(() => {
    if (!videoUrl.trim()) return;

    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    const embedWrapper = createYouTubeEmbed(videoId);

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(embedWrapper);

      const br = document.createElement('br');
      range?.setStartAfter(embedWrapper);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(embedWrapper);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowVideoModal(false);
    setVideoUrl('');
    setSavedRange(null);
  }, [videoUrl, savedRange, setSavedRange]);

  // Iframe/Embed handling
  const insertIframe = useCallback(() => {
    if (!iframeCode.trim()) return;

    const url = iframeCode.trim();

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        if (range) selection?.addRange(range);
      }
    }

    // Get width and height values (default to auto if empty)
    const finalWidth = iframeWidth.trim() || 'auto';
    const finalHeight = iframeHeight.trim() || 'auto';

    // Create wrapper div for the iframe
    const wrapper = document.createElement('div');
    wrapper.style.margin = '10px 0';
    wrapper.style.display = 'block';

    // Create iframe element from URL
    const iframeElement = document.createElement('iframe');
    iframeElement.src = url;
    iframeElement.title = 'Embedded content';
    iframeElement.style.width = finalWidth;
    iframeElement.style.height = finalHeight;
    iframeElement.style.border = 'none';
    iframeElement.setAttribute('allowfullscreen', 'true');

    wrapper.appendChild(iframeElement);

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(wrapper);

      const br = document.createElement('br');
      range?.setStartAfter(wrapper);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(wrapper);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowIframeModal(false);
    setIframeCode('');
    setIframeWidth('auto');
    setIframeHeight('auto');
    setSavedRange(null);
  }, [iframeCode, iframeWidth, iframeHeight, savedRange, setSavedRange]);

  // Embed Code handling
  const insertEmbedCode = useCallback(() => {
    if (!embedCode.trim()) return;

    editorRef.current?.focus();

    let range: Range | undefined;
    const selection = window.getSelection();

    if (savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      range = savedRange.cloneRange();
      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } else if (selection?.rangeCount) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      if (editorRef.current) {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        if (range) selection?.addRange(range);
      }
    }

    // Create wrapper div for the embed code
    const wrapper = document.createElement('div');
    wrapper.style.margin = '10px 0';
    wrapper.innerHTML = embedCode.trim();

    try {
      if (range && !range.collapsed) {
        range.deleteContents();
      }
      range?.insertNode(wrapper);

      const br = document.createElement('br');
      range?.setStartAfter(wrapper);
      range?.insertNode(br);
      range?.setStartAfter(br);
      range?.collapse(true);

      selection?.removeAllRanges();
      if (range) selection?.addRange(range);
    } catch (error) {
      if (editorRef.current) {
        editorRef.current.appendChild(wrapper);
        const br = document.createElement('br');
        editorRef.current.appendChild(br);
      }
    }

    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setShowEmbedCodeModal(false);
    setEmbedCode('');
    setSavedRange(null);
  }, [embedCode, savedRange, setSavedRange]);

  const insertLink = useCallback(() => {
    if (!linkUrl) return;

    editorRef.current?.focus();
    if (savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange);
    }

    execCommand('createLink', linkUrl);
    setShowLinkModal(false);
    setLinkUrl('');
    setSavedRange(null);
  }, [linkUrl, savedRange, setSavedRange, execCommand]);

  // Drag and drop
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleImageUpload(imageFile);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // File input
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  // Content change - IMPROVED
  const handleContentChange = useCallback((e: FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
  }, []);

  // Paste handler
  // const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
  //   createPasteHandler(pasteFilterOptions)(e);
  //   // Update content after paste
  //   setTimeout(() => {
  //     if (editorRef.current) {
  //       setContent(editorRef.current.innerHTML);
  //     }
  //   }, 0);
  // }, [pasteFilterOptions]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          const selection = window.getSelection();
          if (selection?.rangeCount) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
          }
          setShowLinkModal(true);
          break;
      }
    }
  }, [execCommand, setSavedRange]);

  // Modal handlers
  const handleLinkClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
    setShowLinkModal(true);
  }, [setSavedRange]);

  const handleImageClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
    OpenModal(true, false);
  }, [setSavedRange, OpenModal]);

  const handleVideoClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
    setShowVideoModal(true);
  }, [setSavedRange]);

  const handleIframeClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
    setShowIframeModal(true);
  }, [setSavedRange]);

  const handleEmbedCodeClick = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      setSavedRange(selection.getRangeAt(0).cloneRange());
    }
    setShowEmbedCodeModal(true);
  }, [setSavedRange]);

  // Debug logging - ADDED for troubleshooting
  // useEffect(() => {
  //   console.log('Editor state:', {
  //     content,
  //     postContent,
  //     isInitialized,
  //     editorHTML: editorRef.current?.innerHTML
  //   });
  // }, [content, postContent, isInitialized]);

  return (
    <div className={`max-w-7xl mx-auto rounded-lg ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
        <Toolbar
          execCommand={execCommand}
          handleFontFamily={handleFontFamily}
          handleFontSize={handleFontSize}
          onLinkClick={handleLinkClick}
          onImageClick={handleImageClick}
          onVideoClick={handleVideoClick}
          onIframeClick={handleIframeClick}
          onEmbedCodeClick={handleEmbedCodeClick}
        />

        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className={`min-h-96 
              max-h-[calc(50vh-200px)] overflow-y-auto
              
              
              p-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed ${ 
              dragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-500' : ''
              }`}
            style={{
              fontSize: '18px',
              lineHeight: '1.6',
            }}
            onInput={handleContentChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onKeyDown={handleKeyDown}
            // onPaste={handlePaste}
          />

          {!content && (
            <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
              {placeholder}
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 bg-opacity-90 pointer-events-none">
              <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                Drop your image here
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          Words: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} |
          Characters: {content.replace(/<[^>]*>/g, '').length}
        </div>
      </div>

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl('');
        }}
        onInsert={insertLink}
        value={linkUrl}
        onChange={setLinkUrl}
      />

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setVideoUrl('');
        }}
        onInsert={insertYouTubeVideo}
        value={videoUrl}
        onChange={setVideoUrl}
      />

      <IframeModal
        isOpen={showIframeModal}
        onClose={() => {
          setShowIframeModal(false);
          setIframeCode('');
          setIframeWidth('auto');
          setIframeHeight('auto');
        }}
        onInsert={insertIframe}
        value={iframeCode}
        onChange={setIframeCode}
        width={iframeWidth}
        height={iframeHeight}
        onWidthChange={setIframeWidth}
        onHeightChange={setIframeHeight}
      />

      <EmbedCodeModal
        isOpen={showEmbedCodeModal}
        onClose={() => {
          setShowEmbedCodeModal(false);
          setEmbedCode('');
        }}
        onInsert={insertEmbedCode}
        value={embedCode}
        onChange={setEmbedCode}
      />

      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
        }}
        onFileSelect={handleFileSelect}
        uploading={uploading}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
      />

      <EditorStyles />
    </div>
  );
});

WysiwygEditor.displayName = 'WysiwygEditor';

export default WysiwygEditor;