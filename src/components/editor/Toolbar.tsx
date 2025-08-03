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
  AlignLeft,
  AlignCenter,
  AlignRight
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
}

export const Toolbar = memo<ToolbarProps>(({
  execCommand,
  handleFontFamily,
  handleFontSize,
  onLinkClick,
  onImageClick,
  onVideoClick
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
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            if (e.target.value) {
              handleFontFamily(e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          {fontFamilyOptions.map((option, index) => (
            <option key={index} value={option.value} style={{ fontFamily: option.value }}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[70px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              onClick={() => button.action ? button.action() : (button.command && execCommand(button.command))}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              title={button.title}
              type="button"
            >
              <button.icon size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
          )
        ))}
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';