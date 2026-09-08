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

            // Filter out Word junk CSS properties and inline overrides on cleanup
            if (
              prop.startsWith('mso-') ||
              prop.startsWith('-mso-') ||
              prop === 'font-family' ||
              prop === 'font-size' ||
              prop === 'font-weight' ||
              prop === 'color' ||
              prop === 'margin' ||
              prop.startsWith('margin-') ||
              prop === 'line-height' ||
              prop === 'tab-stops' ||
              prop.startsWith('break-') ||
              prop.startsWith('page-break-')
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

      // 4. Unwrap spans without attributes (preserving all inner text nodes and spaces)
      const spans = doc.body.querySelectorAll('span');
      spans.forEach(span => {
        if (span.attributes.length === 0) {
          if (span.childNodes.length === 0) {
            span.remove();
          } else {
            span.replaceWith(...Array.from(span.childNodes));
          }
        }
      });

      // 5. Replace <br> and <br /> tags and wrap text segments into <p> paragraphs
      convertBrToParagraphs(doc);

      // 6. Remove empty div and p elements (including whitespace, &nbsp;, and lone <br>)
      removeEmptyElements(doc);

      // 7. Ensure fixed margin-bottom on all remaining paragraphs
      const allParagraphs = doc.body.querySelectorAll('p');
      allParagraphs.forEach(p => {
        p.style.marginBottom = '16px';
      });

      return doc.body.innerHTML;
    } catch (e) {
      console.error('Error cleaning HTML formatting:', e);
    }
  }

  // Fallback regex cleaning
  let fallbackResult = cleaned
    .replace(/\s*class="[^"]*Mso[^"]*"/gi, '')
    .replace(/\s*lang="[^"]*"/gi, '')
    .replace(/\s*style="[^"]*mso-[^"]*"/gi, '')
    .replace(/\s*style="[^"]*font-family:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*font-size:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*font-weight:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*color:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*margin[^:]*:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*break-[^:]*:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*page-break-[^:]*:[^"]*"/gi, '')
    .replace(/\s*style="[^"]*line-height:[^"]*"/gi, '');

  // Fallback: replace <br> / <br /> with paragraphs
  if (/<br\s*\/?>/i.test(fallbackResult)) {
    fallbackResult = fallbackResult
      // Replace consecutive <br> tags with a paragraph separator
      .replace(/(?:<br\s*\/?>[\s\u00A0]*)+/gi, '</p><p style="margin-bottom: 16px;">')
      // If content doesn't start with an opening tag, wrap the beginning in <p>
      .replace(/^(?!<[a-z])/i, '<p style="margin-bottom: 16px;">')
      // If content doesn't end with a closing tag, close with </p>
      .replace(/(?<!>[a-z]*)$/i, '</p>')
      // Clean up any empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/gi, '');
  }

  // Fallback: remove empty p and div tags
  fallbackResult = fallbackResult
    .replace(/<p[^>]*>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<div(?![^>]*youtube-embed-wrapper)[^>]*>(?:&nbsp;|\s|<br\s*\/?>)*<\/div>/gi, '');

  // Ensure all <p> tags have margin-bottom: 16px in fallback
  fallbackResult = fallbackResult.replace(/<p(?![^>]*style=)([^>]*)>/gi, '<p style="margin-bottom: 16px;"$1>');
  fallbackResult = fallbackResult.replace(/<p([^>]*style=")([^"]*)(")/gi, (match, prefix, styles, suffix) => {
    if (!styles.includes('margin-bottom')) {
      const cleanStyles = styles.trim().endsWith(';') ? styles.trim() : styles.trim() + ';';
      return `<p${prefix}${cleanStyles} margin-bottom: 16px;${suffix}`;
    }
    return match;
  });

  return fallbackResult;
};

/**
 * Replaces <br> and <br /> tags by wrapping text segments into <p> paragraphs.
 * Preserves block-level elements (headings, pre/code blocks, lists, embeds, tables).
 */
export const convertBrToParagraphs = (doc: Document): void => {
  if (!doc || !doc.body) return;

  // If there are no <br> tags at all, nothing to do
  if (doc.body.querySelectorAll('br').length === 0) return;

  // 1. Bubble up <br> tags out of inline elements (e.g. <b>Text 1<br>Text 2</b> -> <b>Text 1</b><br><b>Text 2</b>)
  const inlineTags = new Set([
    'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SPAN', 'A', 'FONT', 'SMALL', 'BIG', 'SUB', 'SUP', 'MARK'
  ]);

  let changed = true;
  let safetyLoop = 0;
  while (changed && safetyLoop < 1000) {
    changed = false;
    safetyLoop++;
    const brs = doc.body.querySelectorAll('br');
    for (let i = 0; i < brs.length; i++) {
      const br = brs[i];
      // Do not touch preformatted code blocks
      if (br.closest('pre') || br.closest('code')) continue;

      const parent = br.parentElement;
      if (parent && inlineTags.has(parent.tagName.toUpperCase())) {
        const grandParent = parent.parentElement;
        if (!grandParent) continue;

        // Collect all nodes after br in parent
        const afterNodes: Node[] = [];
        let next = br.nextSibling;
        while (next) {
          afterNodes.push(next);
          next = next.nextSibling;
        }

        // Create shallow clone of parent for nodes after br
        const clone = parent.cloneNode(false) as Element;
        for (const node of afterNodes) {
          clone.appendChild(node);
        }

        // Remove br from parent
        parent.removeChild(br);

        // Position in grandParent: parent -> br -> clone
        const parentNext = parent.nextSibling;
        if (parentNext) {
          grandParent.insertBefore(br, parentNext);
        } else {
          grandParent.appendChild(br);
        }

        if (clone.hasChildNodes()) {
          const brNext = br.nextSibling;
          if (brNext) {
            grandParent.insertBefore(clone, brNext);
          } else {
            grandParent.appendChild(clone);
          }
        }

        if (!parent.hasChildNodes()) {
          parent.remove();
        }

        changed = true;
        break; // Restart loop to handle updated DOM safely
      }
    }
  }

  // Helper to check if a list of nodes has meaningful content
  const hasContent = (nodes: Node[]): boolean => {
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.replace(/[\s\u00A0]/g, '').length > 0) {
          return true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toUpperCase();
        if (['IMG', 'IFRAME', 'VIDEO', 'AUDIO', 'OBJECT', 'EMBED', 'SVG', 'INPUT', 'HR'].includes(tag)) {
          return true;
        }
        if (el.textContent && el.textContent.replace(/[\s\u00A0]/g, '').length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper to split child nodes of an element at <br> tags into <p> elements
  const splitContainerAtBr = (container: Element): void => {
    const childNodes = Array.from(container.childNodes);
    const segments: Node[][] = [[]];

    for (const child of childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toUpperCase() === 'BR') {
        segments.push([]);
      } else {
        segments[segments.length - 1].push(child);
      }
    }

    const newParagraphs: HTMLParagraphElement[] = [];
    for (const segment of segments) {
      if (hasContent(segment)) {
        const p = doc.createElement('p');
        // If container was a <p>, copy attributes (like class or dir)
        if (container.tagName.toUpperCase() === 'P') {
          for (let i = 0; i < container.attributes.length; i++) {
            const attr = container.attributes[i];
            p.setAttribute(attr.name, attr.value);
          }
        }
        for (const node of segment) {
          p.appendChild(node);
        }
        newParagraphs.push(p);
      }
    }

    if (newParagraphs.length > 0) {
      const parent = container.parentElement;
      if (parent) {
        for (const p of newParagraphs) {
          parent.insertBefore(p, container);
        }
        container.remove();
      }
    } else {
      container.remove();
    }
  };

  // 2. Process blockquotes containing <br>
  const blockquotes = Array.from(doc.body.querySelectorAll('blockquote'));
  for (const bq of blockquotes) {
    if (bq.querySelectorAll('br').length > 0) {
      const childNodes = Array.from(bq.childNodes);
      const segments: Node[][] = [[]];
      for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toUpperCase() === 'BR') {
          segments.push([]);
        } else {
          segments[segments.length - 1].push(child);
        }
      }
      bq.innerHTML = '';
      for (const segment of segments) {
        if (hasContent(segment)) {
          const p = doc.createElement('p');
          for (const node of segment) {
            p.appendChild(node);
          }
          bq.appendChild(p);
        }
      }
    }
  }

  // 3. Process <p> tags containing <br>
  const paragraphs = Array.from(doc.body.querySelectorAll('p'));
  for (const p of paragraphs) {
    if (p.parentElement && p.querySelectorAll('br').length > 0) {
      splitContainerAtBr(p);
    }
  }

  // 4. Process <div> tags containing <br> (skip special wrappers like youtube-embed-wrapper or divs containing other blocks)
  const divs = Array.from(doc.body.querySelectorAll('div'));
  for (const div of divs) {
    if (
      div.parentElement &&
      !div.classList.contains('youtube-embed-wrapper') &&
      div.querySelectorAll('br').length > 0
    ) {
      const hasNestedBlocks = div.querySelector('h1, h2, h3, h4, h5, h6, pre, table, ul, ol, blockquote');
      if (!hasNestedBlocks) {
        splitContainerAtBr(div);
      }
    }
  }

  // 5. Process direct children of doc.body (loose text/inline nodes and <br> at root level)
  const blockTagNames = new Set([
    'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'TABLE', 'PRE', 'FIGURE', 'HR', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV', 'ASIDE'
  ]);

  const bodyChildren = Array.from(doc.body.childNodes);
  let currentGroup: Node[] = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;
    const groupNodes = [...currentGroup];
    currentGroup = [];

    const hasBr = groupNodes.some(
      n => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toUpperCase() === 'BR'
    );

    if (!hasBr && !hasContent(groupNodes)) {
      for (const node of groupNodes) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
      return;
    }

    const segments: Node[][] = [[]];
    for (const node of groupNodes) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toUpperCase() === 'BR') {
        segments.push([]);
      } else {
        segments[segments.length - 1].push(node);
      }
    }

    // Insert an anchor so moving nodes doesn't invalidate insertion position
    const firstNode = groupNodes[0];
    const parent = firstNode.parentElement || doc.body;
    const anchor = doc.createTextNode('');
    parent.insertBefore(anchor, firstNode);

    for (const segment of segments) {
      if (hasContent(segment)) {
        const p = doc.createElement('p');
        for (const node of segment) {
          p.appendChild(node);
        }
        parent.insertBefore(p, anchor);
      }
    }

    // Clean up original nodes that remained in parent (e.g. BR tags) and remove anchor
    for (const node of groupNodes) {
      if (node.parentNode === parent) {
        parent.removeChild(node);
      }
    }
    anchor.remove();
  };

  for (const child of bodyChildren) {
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      blockTagNames.has((child as Element).tagName.toUpperCase())
    ) {
      flushGroup();
    } else {
      currentGroup.push(child);
    }
  }
  flushGroup();

  // 6. Final cleanup: remove any leftover standalone <br> tags outside pre/code
  const remainingBrs = doc.body.querySelectorAll('br');
  remainingBrs.forEach(br => {
    if (!br.closest('pre') && !br.closest('code')) {
      br.remove();
    }
  });

  // 7. Remove completely empty paragraphs and set fixed margin-bottom
  const allPs = doc.body.querySelectorAll('p');
  allPs.forEach(p => {
    if (!hasContent(Array.from(p.childNodes))) {
      p.remove();
    } else {
      p.style.marginBottom = '16px';
    }
  });
};

/**
 * Removes empty <p> and <div> elements from the document.
 * Considers elements containing only whitespace, &nbsp;, or <br> as empty,
 * while preserving media (img, iframe, video), embeds, and elements with text.
 */
export const removeEmptyElements = (doc: Document): void => {
  if (!doc || !doc.body) return;

  const isElementEmpty = (el: Element): boolean => {
    // Keep special wrappers like youtube embed wrapper
    if (el.classList.contains('youtube-embed-wrapper') || el.querySelector('.youtube-embed-wrapper')) {
      return false;
    }

    // Keep elements containing media, void elements, or inputs
    if (el.querySelector('img, iframe, video, audio, object, embed, svg, canvas, input, button, hr')) {
      return false;
    }

    // Check if there is any visible text (excluding whitespace and non-breaking space)
    const text = el.textContent || '';
    if (text.replace(/[\s\u00A0]/g, '').length > 0) {
      return false;
    }

    return true;
  };

  // Run bottom-up in a loop to cleanly handle nested empty elements (e.g. <div><p></p></div>)
  let changed = true;
  let safetyCount = 0;
  while (changed && safetyCount < 20) {
    changed = false;
    safetyCount++;
    const candidates = doc.body.querySelectorAll('p, div');
    for (let i = candidates.length - 1; i >= 0; i--) {
      const el = candidates[i];
      if (isElementEmpty(el)) {
        el.remove();
        changed = true;
      }
    }
  }
};