export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const createYouTubeEmbed = (videoId: string, width = 560, height = 315): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'youtube-embed-wrapper';
  wrapper.style.cssText = `
    position: relative;
    width: 100%;
    max-width: ${width}px;
    margin: 20px auto;
    padding: 0;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;

  wrapper.innerHTML = `
    <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
      <iframe 
        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
        frameBorder="0" 
        allowFullScreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        title="YouTube video player"
      ></iframe>
    </div>
  `;

  return wrapper;
};

export const fixImageUrls = (htmlContent: string | null | undefined, domain = 'https://campustimes.press'): string => {
  if (!htmlContent) return '';
  const imgRegex = /<img([^>]*)\ssrc="(\/[^"]*)"([^>]*)>/gi;
  return htmlContent.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
    return `<img${beforeSrc} src="${domain}${src}"${afterSrc}>`;
  });
};

export const cleanHtmlFormatting = (htmlContent: string | null | undefined): string => {
  if (!htmlContent) return '';

  let cleaned = htmlContent
    // Remove HTML comments and MS Word comments like <!--[if gte mso 9]>...<![endif]-->
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove MS Word specific tags
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?w:[^>]*>/gi, '')
    .replace(/<\/?m:[^>]*>/gi, '')
    .replace(/<\/?v:[^>]*>/gi, '');

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/html');

      // Remove unwanted script, style, meta, link, xml elements
      const unwanted = doc.body.querySelectorAll('script, style, meta, link, xml, object, embed');
      unwanted.forEach(el => el.remove());

      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach(el => {
        // 1. Remove MS Word / Office attributes
        const attrsToRemove: string[] = [];
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          
          if (
            name === 'lang' ||
            name.startsWith('xml') ||
            name.startsWith('xmlns') ||
            name.startsWith('mso')
          ) {
            attrsToRemove.push(attr.name);
          }
        }
        attrsToRemove.forEach(name => el.removeAttribute(name));

        // 2. Clean class attribute (remove MsoNormal, MsoListParagraph, etc.)
        if (el.hasAttribute('class')) {
          const className = el.getAttribute('class') || '';
          const newClasses = className
            .split(/\s+/)
            .filter(cls => {
              const lower = cls.toLowerCase();
              return !lower.startsWith('mso') && lower !== 'msonormal' && lower !== 'normal';
            })
            .join(' ');
          
          if (newClasses) {
            el.setAttribute('class', newClasses);
          } else {
            el.removeAttribute('class');
          }
        }

        // 3. Clean inline style attribute (remove mso-*, font-family, font-size, line-height, Word margins)
        if (el.hasAttribute('style')) {
          const styleAttr = el.getAttribute('style') || '';
          const declarations = styleAttr.split(';');
          const cleanDeclarations: string[] = [];

          declarations.forEach(decl => {
            const trimmed = decl.trim();
            if (!trimmed) return;
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) return;

            const prop = trimmed.slice(0, colonIndex).trim().toLowerCase();
            const val = trimmed.slice(colonIndex + 1).trim();

            // Filter out Word junk CSS properties
            if (
              prop.startsWith('mso-') ||
              prop.startsWith('-mso-') ||
              prop === 'font-family' ||
              prop === 'font-size' ||
              prop === 'line-height' ||
              prop === 'margin-bottom' ||
              prop === 'margin-top' ||
              prop === 'margin-left' ||
              prop === 'margin-right' ||
              prop === 'tab-stops'
            ) {
              return;
            }

            cleanDeclarations.push(`${prop}: ${val}`);
          });

          if (cleanDeclarations.length > 0) {
            el.setAttribute('style', cleanDeclarations.join('; '));
          } else {
            el.removeAttribute('style');
          }
        }
      });

      // 4. Unwrap or remove empty/redundant spans
      const spans = doc.body.querySelectorAll('span');
      spans.forEach(span => {
        if (span.attributes.length === 0) {
          if (!span.textContent || span.textContent.trim() === '') {
            span.remove();
          } else if (span.parentNode) {
            while (span.firstChild) {
              span.parentNode.insertBefore(span.firstChild, span);
            }
            span.remove();
          }
        }
      });

      return doc.body.innerHTML;
    } catch (e) {
      console.error('Error cleaning HTML formatting:', e);
    }
  }

  // Fallback regex cleaning
  return cleaned
    .replace(/\s*class="[^"]*Mso[^"]*"/gi, '')
    .replace(/\s*lang="[^"]*"/gi, '')
    .replace(/\s*style="[^"]*mso-[^"]*"/gi, '')
    .replace(/\s*style="[^"]*font-family:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*font-size:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*line-height:[^"]*"/gi, '');
};