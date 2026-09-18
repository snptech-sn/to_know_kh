/**
 * Client-side image compression utility
 * Prevents Firestore document overflow and payload rejection by compressing photos
 * from smartphones and cameras down to ~40KB-70KB while maintaining high visual fidelity.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.70
): Promise<string> {
  return new Promise((resolve) => {
    // If already very small (< 60KB), read directly
    if (file.size < 60 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        // Calculate scaled dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context fails
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } catch (err) {
        console.warn('Canvas compression failed, falling back to raw file:', err);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Batch compress multiple files with progress callback
 */
export async function compressMultipleImageFiles(
  files: File[] | FileList,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  const results: string[] = [];

  for (let i = 0; i < fileArray.length; i++) {
    const compressed = await compressImageFile(fileArray[i]);
    if (compressed) {
      results.push(compressed);
    }
    onProgress?.(i + 1, fileArray.length);
  }

  return results;
}
