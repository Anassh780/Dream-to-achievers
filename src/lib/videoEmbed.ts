import { VideoSourceType } from '@/types';

export interface ParsedVideoEmbed {
  embedUrl: string;
  sourceType: VideoSourceType;
  thumbnailUrl?: string;
  sourceDirectUrl?: string;
  isDirectVideo: boolean;
  isValid: boolean;
  error?: string;
  extractedTitle?: string;
}

/**
 * Extracts iframe src or parses arbitrary video platform URLs into clean embed URLs.
 * Supports:
 * - Full <iframe> HTML snippets (YouTube, Vimeo, Facebook, Loom, Google Drive, Canva, etc.)
 * - YouTube (watch, share, shorts, embed, mobile) -> privacy-enhanced youtube-nocookie embed
 * - Vimeo (standard video, player, showcase)
 * - Loom (share, embed)
 * - Google Drive (view, preview, open?id, uc?id)
 * - Dailymotion (video, dai.ly shortlink)
 * - Direct video files (.mp4, .webm, .ogg, .mov)
 * - Any valid HTTPS embeddable iframe URL (Wistia, BunnyCDN, TikTok, Facebook player, etc.)
 */
export function parseVideoEmbed(rawInput: string): ParsedVideoEmbed {
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return {
      embedUrl: '',
      sourceType: 'generic_embed',
      isDirectVideo: false,
      isValid: false,
      error: 'Please enter a video URL or iframe embed code.',
    };
  }

  let targetUrl = trimmed;
  let extractedTitle: string | undefined;

  // 1. If user pasted a full <iframe> snippet, extract src and optional title
  if (trimmed.includes('<iframe') || trimmed.includes('&lt;iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    const titleMatch = trimmed.match(/title=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      targetUrl = srcMatch[1].trim();
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].trim();
      }
    } else {
      return {
        embedUrl: '',
        sourceType: 'iframe_custom',
        isDirectVideo: false,
        isValid: false,
        error: 'Could not find a valid src="..." attribute inside the iframe code.',
      };
    }
  }

  // Normalize protocol-relative URLs
  if (targetUrl.startsWith('//')) {
    targetUrl = `https:${targetUrl}`;
  }

  // 2. Direct Video Files (.mp4, .webm, .ogg, .mov)
  const cleanUrlWithoutQuery = targetUrl.split('?')[0].toLowerCase();
  if (
    cleanUrlWithoutQuery.endsWith('.mp4') ||
    cleanUrlWithoutQuery.endsWith('.webm') ||
    cleanUrlWithoutQuery.endsWith('.ogg') ||
    cleanUrlWithoutQuery.endsWith('.mov')
  ) {
    return {
      embedUrl: targetUrl,
      sourceType: 'direct_video',
      sourceDirectUrl: targetUrl,
      isDirectVideo: true,
      isValid: true,
      extractedTitle,
    };
  }

  // 3. YouTube (watch, share, shorts, embed, mobile)
  const ytRegex =
    /(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = targetUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      sourceType: 'youtube',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      sourceDirectUrl: `https://www.youtube.com/watch?v=${videoId}`,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  // 4. Vimeo
  const vimeoRegex =
    /(?:https?:)?\/\/(?:www\.)?(?:vimeo\.com\/(?:.*\/)?|player\.vimeo\.com\/video\/)(\d+)/i;
  const vimeoMatch = targetUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0`,
      sourceType: 'vimeo',
      sourceDirectUrl: `https://vimeo.com/${vimeoId}`,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  // 5. Loom
  const loomRegex = /(?:https?:)?\/\/(?:www\.)?loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i;
  const loomMatch = targetUrl.match(loomRegex);
  if (loomMatch && loomMatch[1]) {
    const loomId = loomMatch[1];
    return {
      embedUrl: `https://www.loom.com/embed/${loomId}`,
      sourceType: 'loom',
      thumbnailUrl: `https://cdn.loom.com/sessions/thumbnails/${loomId}-with-play.gif`,
      sourceDirectUrl: `https://www.loom.com/share/${loomId}`,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  // 6. Google Drive Video Preview (supports /file/d/..., open?id=..., uc?id=..., and docs.google.com)
  const driveRegex =
    /(?:https?:)?\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/i;
  const driveMatch = targetUrl.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const driveId = driveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      sourceType: 'drive',
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
      sourceDirectUrl: `https://drive.google.com/file/d/${driveId}/view`,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  // 7. Dailymotion
  const dmRegex =
    /(?:https?:)?\/\/(?:www\.)?(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i;
  const dmMatch = targetUrl.match(dmRegex);
  if (dmMatch && dmMatch[1]) {
    const dmId = dmMatch[1];
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${dmId}`,
      sourceType: 'dailymotion',
      thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${dmId}`,
      sourceDirectUrl: `https://www.dailymotion.com/video/${dmId}`,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  // 8. General HTTPS URL (Generic Embed / iframe embed)
  if (/^https?:\/\//i.test(targetUrl)) {
    return {
      embedUrl: targetUrl,
      sourceType: 'generic_embed',
      sourceDirectUrl: targetUrl,
      isDirectVideo: false,
      isValid: true,
      extractedTitle,
    };
  }

  return {
    embedUrl: targetUrl,
    sourceType: 'generic_embed',
    sourceDirectUrl: targetUrl,
    isDirectVideo: false,
    isValid: false,
    error: 'Invalid video URL. Please provide a full link starting with http:// or https://',
  };
}

/**
 * Returns metadata badge styles and label for the video source.
 */
export function getSourceMeta(sourceType: VideoSourceType) {
  switch (sourceType) {
    case 'youtube':
      return {
        label: 'YouTube',
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-400',
        dot: 'bg-red-500',
      };
    case 'vimeo':
      return {
        label: 'Vimeo',
        bg: 'bg-sky-500/15',
        border: 'border-sky-500/30',
        text: 'text-sky-400',
        dot: 'bg-sky-400',
      };
    case 'loom':
      return {
        label: 'Loom',
        bg: 'bg-purple-500/15',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        dot: 'bg-purple-400',
      };
    case 'drive':
      return {
        label: 'Google Drive',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    case 'dailymotion':
      return {
        label: 'Dailymotion',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        dot: 'bg-blue-400',
      };
    case 'direct_video':
      return {
        label: 'Direct MP4',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    case 'iframe_custom':
    case 'generic_embed':
    default:
      return {
        label: 'Web Embed',
        bg: 'bg-[#D9C08A]/15',
        border: 'border-[#D9C08A]/30',
        text: 'text-[#D9C08A]',
        dot: 'bg-[#D9C08A]',
      };
  }
}
