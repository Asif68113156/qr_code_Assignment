import jsQR from 'jsqr';
import { validateImageFile } from './validators';

const MAX_SIDE = 1600;

/** Decodes a QR code from an uploaded image File. Resolves to the text or throws an Error with a friendly message. */
export async function decodeImageFile(file) {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('The selected file could not be read as an image.'));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
    if (!code || !code.data) throw new Error('No QR code was found in this image. Try a clearer or closer picture.');
    return code.data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
