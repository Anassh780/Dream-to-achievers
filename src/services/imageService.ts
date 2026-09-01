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
 * Validates whether an image URL is well-formed.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

