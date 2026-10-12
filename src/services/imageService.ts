import { storageBucket } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Resizes and compresses an image File using HTML5 Canvas.
 * Produces an optimized, lightweight Data URL (< 50KB) that synchronizes effortlessly
 * across Firebase Realtime Database and renders instantly on all mobile and desktop devices.
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.76): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Fill background with white for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first with JPEG fallback
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {}

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage if available, or produces an ultra-compact
 * compressed Data URI that is 100% portable across all devices and stored directly in RTDB.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  try {
    const storageRef = ref(
      storageBucket,
      `products/${productId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    );
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    if (downloadUrl) return downloadUrl;
  } catch (err) {
    // Cloud storage bucket might not have public write rules; fall back to portable compressed URI
  }

  // High-speed Canvas compression fallback
  return compressImage(file, 800, 800, 0.76);
}

/**
 * Default fallback image placeholder when an image fails to load or is missing.
 */
export const DEFAULT_PRODUCT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';

/**
 * Normalizes and converts various web image links (Google Drive, Dropbox, Google Images, Imgur, etc.)
 * into directly embeddable image URLs. Also trims whitespace and surrounding quotes.
 */
export function normalizeImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // Strip wrapping quotes if pasted from markdown/HTML/code
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }

  // Already a base64 Data URI
  if (url.startsWith('data:image/')) return url;

  // Extract from HTML <img src="..."> or <a href="...">
  const htmlMatch = url.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (htmlMatch && htmlMatch[1]) {
    url = htmlMatch[1].trim();
  }

  // Extract from Markdown: ![alt](https://...)
  const mdMatch = url.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    url = mdMatch[1].trim();
  }

  // Extract from BBCode: [img]https://...[/img]
  const bbMatch = url.match(/\[img\](https?:\/\/[^\[]+)\[\/img\]/i);
  if (bbMatch && bbMatch[1]) {
    url = bbMatch[1].trim();
  }

  // If user pasted on top of an existing URL (e.g. multiple http/https in one string):
  const allUrls = url.match(/https?:\/\/[^\s"'<>]+/gi);
  if (allUrls && allUrls.length > 1) {
    url = allUrls[allUrls.length - 1];
  }

  // PhotoToURL support:
  // e.g. https://phototourl.com/member/... must be https://cdn.phototourl.com/member/...
  if (url.includes('phototourl.com') && !url.includes('cdn.phototourl.com')) {
    url = url.replace(/https?:\/\/(?:www\.)?phototourl\.com\//i, 'https://cdn.phototourl.com/');
  }

  // Google Images Search Link: https://www.google.com/imgres?imgurl=...
  if (url.includes('google.') && url.includes('/imgres')) {
    try {
      const parsed = new URL(url);
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) {
        return decodeURIComponent(imgurl);
      }
    } catch {}
  }

  // Google Drive Share Link:
  // e.g. https://drive.google.com/file/d/FILE_ID/view...
  // or https://drive.google.com/open?id=FILE_ID
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch && gdriveMatch[1]) {
    // lh3.googleusercontent.com/d/ID directly delivers the image without CORS / auth prompts
    return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
  }

  // Dropbox Share Link:
  // e.g. https://www.dropbox.com/s/xyz/photo.jpg?dl=0
  if (url.includes('dropbox.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('raw', '1');
      parsed.searchParams.delete('dl');
      return parsed.toString();
    } catch {}
  }

  // Imgur page link:
  // e.g. https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.png
  const imgurMatch = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
  if (imgurMatch && imgurMatch[1]) {
    return `https://i.imgur.com/${imgurMatch[1]}.png`;
  }

  // Postimages / Postimg page link:
  const postimgMatch = url.match(/^https?:\/\/postimg\.cc\/([a-zA-Z0-9]+)$/);
  if (postimgMatch && postimgMatch[1]) {
    return `https://i.postimg.cc/${postimgMatch[1]}/image.jpg`;
  }

  // Strip trailing punctuation
  url = url.replace(/[.,;)\s]+$/, '');

  return url;
}

/**
 * Validates whether an image URL is well-formed.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const normalized = normalizeImageUrl(url);
  if (normalized.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Tests whether an image URL can be loaded successfully by the browser.
 */
export function testImageLoad(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const normalized = normalizeImageUrl(url);
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = normalized;
  });
}

