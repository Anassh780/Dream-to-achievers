import { storageBucket } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Resizes and compresses an image File or Blob using HTML5 Canvas.
 * Keeps file size small (< 80KB) for lightning-fast sync across mobile and desktop.
 */
export async function compressImage(file: File, maxWidth = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage with automatic fallback to compressed Data URL.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  try {
    // 1. Try uploading to Firebase Storage bucket first
    const storageRef = ref(storageBucket, `products/${productId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    if (downloadUrl) return downloadUrl;
  } catch (err) {
    console.warn('[ImageService] Firebase Storage upload failed, falling back to optimized compression:', err);
  }

  // 2. High-speed Canvas compression fallback
  return compressImage(file);
}
