import * as FileSystem from 'expo-file-system/legacy';

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.heic') || lower.includes('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic';
  return 'jpg';
}

export type PreparedPhoto = {
  uri: string;
  name: string;
  type: string;
};

/**
 * Normalise une URI photo pour l'upload Android.
 * Les URI content:// de la galerie sont copiées en cache file:// (FormData/upload natif).
 */
export async function preparePhotoForUpload(
  uri: string,
  mimeType?: string | null,
  fileName?: string | null,
): Promise<PreparedPhoto> {
  const type = mimeType?.split(';')[0]?.trim() || guessMimeType(uri);
  const ext = extensionForMime(type);
  const name = fileName?.trim() || `photo.${ext}`;

  if (uri.startsWith('file://')) {
    return { uri, name, type };
  }

  const dest = `${FileSystem.cacheDirectory}moodify-upload-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return { uri: dest, name, type };
}
