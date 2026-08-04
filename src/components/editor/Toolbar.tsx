import React, { memo, type ChangeEvent } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Code,
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser
} from 'lucide-react';
import { ToolbarItem, SelectOption } from './types';
import { headingOptions, fontSizeOptions, fontFamilyOptions } from './constants';

interface ToolbarProps {
  execCommand: (command: string, value?: string) => void;
  handleFontFamily: (fontFamily: string) => void;
  handleFontSize: (size: string) => void;
  onLinkClick: () => void;
  onImageClick: () => void;
  onVideoClick: () => void;
  onIframeClick: () => void;
  onEmbedCodeClick: () => void;
  isSourceView?: boolean;
  onToggleSourceView?: () => void;
  onCleanFormatting?: () => void;
}

export const Toolbar = memo<ToolbarProps>(({
  execCommand,
  handleFontSize,
  onLinkClick,
  onImageClick,
  onVideoClick,
  onIframeClick,
  onEmbedCodeClick,
  isSourceView = false,
  onToggleSourceView,
  onCleanFormatting
}) => {
  const toolbarButtons: ToolbarItem[] = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: Link, action: onLinkClick, title: 'Insert Link (Ctrl+K)' },
    { icon: Image, action: onImageClick, title: 'Insert Image' },
    { icon: Video, action: onVideoClick, title: 'Insert YouTube Video' },
    { icon: Code, action: onIframeClick, title: 'Embed iframe' },
    { icon: FileCode, action: onEmbedCodeClick, title: 'Embed code (HTML)' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          disabled={isSourceView}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const option = headingOptions.find(opt => opt.value === e.target.value);
            if (option) execCommand(option.command || "", option.value || "");
          }}
        >
          {headingOptions.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          disabled={isSourceView}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[70px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            if (e.target.value) {
              handleFontSize(e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          {fontSizeOptions.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {toolbarButtons.map((button, index) => (
          button.divider ? (
            <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          ) : (
            <button
              key={index}
              disabled={isSourceView}
              onClick={() => button.action ? button.action() : (button.command && execCommand(button.command))}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title={button.title}
              type="button"
            >
              <button.icon size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
          )
        ))}

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {onCleanFormatting && (
          <button
            type="button"
            disabled={isSourceView}
            onClick={onCleanFormatting}
            className="px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clean Formatting (Remove MS Word classes, styles & junk attributes)"
          >
            <Eraser size={15} />
            <span>Cleanup</span>
          </button>
        )}

        {onToggleSourceView && (
          <button
            type="button"
            onClick={onToggleSourceView}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 ${
              isSourceView
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
            }`}
            title={isSourceView ? 'Switch to Visual Editor' : 'Show Markup Code / Tags'}
          >
            <FileCode size={15} />
            <span>{isSourceView ? 'Visual Editor' : 'Show Code'}</span>
          </button>
        )}
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';