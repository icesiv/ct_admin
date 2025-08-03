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