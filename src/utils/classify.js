/**
 * Detects what kind of data a decoded QR value contains.
 * Returns one of: url | wifi | email | phone | upi | text
 */
export function classify(value = '') {
  const v = String(value).trim();
  if (/^WIFI:/i.test(v)) return 'wifi';
  if (/^upi:\/\//i.test(v)) return 'upi';
  if (/^mailto:/i.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email';
  if (/^tel:/i.test(v) || /^\+?[\d\s-]{7,15}$/.test(v)) return 'phone';
  if (isUrl(v)) return 'url';
  return 'text';
}

export function isUrl(value = '') {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const TYPE_LABELS = {
  url: 'URL',
  wifi: 'Wi-Fi',
  email: 'Email',
  phone: 'Phone',
  upi: 'UPI Payment',
  text: 'Text',
};

export const SOURCE_LABELS = {
  camera: 'Camera',
  upload: 'Upload',
  manual: 'Manual',
};
