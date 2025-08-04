// Patterns to detect different code types
const CODE_PATTERNS = {
  html: [
    /<\s*\/?\s*[a-zA-Z][a-zA-Z0-9]*[^>]*>/g, // HTML tags
    /<!DOCTYPE/gi,
    /&[a-zA-Z]+;/g, // HTML entities
  ],
  css: [
    /\{[^}]*:[^}]*\}/g, // CSS rules
    /@media\s*\([^)]*\)/gi,
    /@import\s+/gi,
    /\#[a-zA-Z0-9_-]+\s*\{/g, // CSS ID selectors
    /\.[a-zA-Z0-9_-]+\s*\{/g, // CSS class selectors
  ],
  javascript: [
    /\b(function|var|let|const|if|else|for|while|return|class|extends|import|export|require)\b/g,
    /console\.(log|error|warn|info)/g,
    /document\.(getElementById|querySelector|addEventListener)/g,
    /window\./g,
    /=>\s*\{/g, // Arrow functions
    /\$\([^)]*\)/g, // jQuery
  ],
  sql: [
    /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ORDER BY|GROUP BY)\b/gi,
    /\bTABLE\b/gi,
    /\bDATABASE\b/gi,
  ],
  json: [
    /^\s*[\{\[]/,
    /["\s]*:\s*["\{\[\]]/g,
  ],
  xml: [
    /<\?xml/gi,
    /<\/[a-zA-Z][a-zA-Z0-9]*>/g,
  ],
  php: [
    /<\?php/gi,
    /\$[a-zA-Z_][a-zA-Z0-9_]*/g,
  ],
  python: [
    /\bdef\s+[a-zA-Z_]/g,
    /\bimport\s+/g,
    /\bfrom\s+\w+\s+import/g,
    /\bprint\s*\(/g,
  ],
  codeBlocks: [
    /```[\s\S]*```/g, // Markdown code blocks
    /`[^`]+`/g, // Inline code
  ]
};

// Common code indicators
const COMMON_CODE_INDICATORS = [
  /^\s*\/\/.*$/gm, // Single line comments
  /\/\*[\s\S]*?\*\//g, // Multi-line comments
  /^\s*#.*$/gm, // Hash comments
  /^\s*\/\*\*[\s\S]*?\*\//g, // JSDoc comments
  /\w+\s*\(\s*\)\s*\{/g, // Function definitions
  /\bstruct\b|\bunion\b|\benum\b/g, // C/C++ keywords
  /\b(public|private|protected|static|final|abstract)\b/g, // OOP keywords
];

export interface PasteFilterOptions {
  allowHtml?: boolean;
  allowBasicFormatting?: boolean;
  blockCodePatterns?: boolean;
  customBlockedPatterns?: RegExp[];
  onBlockedPaste?: (blockedContent: string, detectedType: string) => void;
}

export const detectCodeType = (text: string): string | null => {
  // Check for common code indicators first
  for (const pattern of COMMON_CODE_INDICATORS) {
    if (pattern.test(text)) {
      return 'code';
    }
  }

  // Check specific code types
  for (const [type, patterns] of Object.entries(CODE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return type;
      }
    }
  }

  return null;
};

export const hasCodePatterns = (text: string): boolean => {
  return detectCodeType(text) !== null;
};

export const cleanPasteContent = (
  htmlContent: string, 
  plainText: string, 
  options: PasteFilterOptions = {}
): string => {
  const {
    allowHtml = false,
    allowBasicFormatting = true,
    blockCodePatterns = true,
    customBlockedPatterns = [],
    onBlockedPaste
  } = options;

  // Check if content contains code patterns
  if (blockCodePatterns) {
    const detectedType = detectCodeType(plainText) || detectCodeType(htmlContent);
    
    if (detectedType) {
      onBlockedPaste?.(plainText, detectedType);
      return ''; // Block the entire paste
    }
  }

  // Check custom blocked patterns
  for (const pattern of customBlockedPatterns) {
    if (pattern.test(plainText) || pattern.test(htmlContent)) {
      onBlockedPaste?.(plainText, 'custom');
      return '';
    }
  }

  // If HTML is not allowed, return plain text
  if (!allowHtml) {
    return plainText;
  }

  // If basic formatting is allowed, keep only safe tags
  if (allowBasicFormatting) {
    const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove script tags and other dangerous elements
    const dangerousTags = tempDiv.querySelectorAll('script, style, iframe, object, embed, form, input, button');
    dangerousTags.forEach(tag => tag.remove());
    
    // Keep only allowed tags
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        // Replace with its text content
        const textNode = document.createTextNode(element.textContent || '');
        element.parentNode?.replaceChild(textNode, element);
      }
    });
    
    return tempDiv.innerHTML;
  }

  return plainText;
};

export const createPasteHandler = (options: PasteFilterOptions = {}) => {
  return (e: ClipboardEvent | React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;
    
    const htmlData = clipboardData.getData('text/html');
    const plainTextData = clipboardData.getData('text/plain');
    
    console.log('Paste detected:', { htmlData, plainTextData }); // Debug log
    
    const cleanedContent = cleanPasteContent(htmlData, plainTextData, options);
    
    console.log('Cleaned content:', cleanedContent); // Debug log
    
    if (cleanedContent) {
      // Insert the cleaned content
      if (options.allowHtml && cleanedContent !== plainTextData) {
        document.execCommand('insertHTML', false, cleanedContent);
      } else {
        document.execCommand('insertText', false, cleanedContent);
      }
    }
  };
};