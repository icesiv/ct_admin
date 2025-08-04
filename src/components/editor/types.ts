import { LucideIcon } from 'lucide-react';

export interface ImageData {
  file_url: string;
  width?: number;
  height?: number;
  thumb?: string;
}

export interface ToolbarButton {
  icon: LucideIcon;
  command?: string;
  action?: () => void;
  title: string;
  divider?: never;
}

export interface ToolbarDivider {
  divider: true;
  icon?: never;
  command?: never;
  action?: never;
  title?: never;
}

export type ToolbarItem = ToolbarButton | ToolbarDivider;

export interface SelectOption {
  label: string;
  value: string;
  command?: string;
}

export interface PasteFilterOptions {
  allowHtml?: boolean;
  allowBasicFormatting?: boolean;
  blockCodePatterns?: boolean;
  customBlockedPatterns?: RegExp[];
  onBlockedPaste?: (blockedContent: string, detectedType: string) => void;
}

export interface WysiwygEditorProps {
  updatePostContent: (content: string) => void;
  postContent?: string | null;
  baseUrl?: string;
  maxImageSize?: number;
  placeholder?: string;
  className?: string;
  OpenModal: (flag: boolean, isFeature: boolean) => void;
  pasteFilterOptions?: PasteFilterOptions;
}

export interface WysiwygEditorRef {
  insertImageIntoEditor: (imageData: ImageData) => void;
  getCurrentContent: () => string;
}