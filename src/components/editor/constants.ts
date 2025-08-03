import { SelectOption } from './types';

export const headingOptions: SelectOption[] = [
  { label: 'Normal', command: 'formatBlock', value: 'div' },
  { label: 'Heading 1', command: 'formatBlock', value: 'h1' },
  { label: 'Heading 2', command: 'formatBlock', value: 'h2' },
  { label: 'Heading 3', command: 'formatBlock', value: 'h3' },
  { label: 'Heading 4', command: 'formatBlock', value: 'h4' },
  { label: 'Heading 5', command: 'formatBlock', value: 'h5' },
  { label: 'Heading 6', command: 'formatBlock', value: 'h6' },
];

export const fontSizeOptions: SelectOption[] = [
  { label: '8px', value: '8px' },
  { label: '10px', value: '10px' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '48px', value: '48px' },
  { label: '60px', value: '60px' },
  { label: '72px', value: '72px' },
];

export const fontFamilyOptions: SelectOption[] = [
  { label: 'Default', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Century Gothic', value: '"Century Gothic", CenturyGothic, sans-serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
];