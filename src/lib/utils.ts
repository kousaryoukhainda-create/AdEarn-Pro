import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmbedUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Handle YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      if (pathname.startsWith('/embed/')) return url;

      let videoId = '';
      if (hostname.includes('youtu.be')) {
        videoId = pathname.slice(1);
      } else if (pathname.startsWith('/shorts/')) {
        videoId = pathname.split('/')[2];
      } else {
        videoId = urlObj.searchParams.get('v') || '';
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
      }
    }

    // Handle Vimeo
    if (hostname.includes('vimeo.com') && !pathname.toLowerCase().startsWith('/video/')) {
      const videoId = pathname.split('/').pop();
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`;
      }
    }

    return url;
  } catch {
    return url;
  }
}
