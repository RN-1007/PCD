/**
 * Formats bytes into human-readable string (KB, MB).
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Converts a single Image File (JPG/PNG) to WebP format using Browser Canvas API.
 * @param {File} file 
 * @param {number} quality (10 - 100)
 * @returns {Promise<Object>} Converted file details including blob and object URL
 */
export function convertImageToWebP(file, quality = 80) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        // Handle transparency background for PNG if needed (draw image clean)
        ctx.drawImage(img, 0, 0);

        const qualityFraction = Math.max(0.1, Math.min(1.0, quality / 100));

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              return reject(new Error('Canvas toBlob conversion failed'));
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const convertedFileName = `${baseName}.webp`;
            const convertedUrl = URL.createObjectURL(blob);
            const originalSizeNum = file.size;
            const convertedSizeNum = blob.size;

            const savedBytes = originalSizeNum - convertedSizeNum;
            const percentSaved = originalSizeNum > 0 
              ? Math.round((savedBytes / originalSizeNum) * 100) 
              : 0;

            resolve({
              id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              file,
              originalName: file.name,
              originalSizeFormatted: formatBytes(originalSizeNum),
              originalSizeBytes: originalSizeNum,
              convertedBlob: blob,
              convertedUrl,
              convertedFileName,
              convertedSizeFormatted: formatBytes(convertedSizeNum),
              convertedSizeBytes: convertedSizeNum,
              width: canvas.width,
              height: canvas.height,
              percentSaved
            });
          },
          'image/webp',
          qualityFraction
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file'));
    };

    img.src = objectUrl;
  });
}
