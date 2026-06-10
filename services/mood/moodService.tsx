// Mood detection API — submits a photo and returns the detected humor + metadata.
// Playlist resolution from the API response is handled by localPlaylistService.

import * as FileSystem from 'expo-file-system/legacy';
import { preparePhotoForUpload } from '@/utils/media/preparePhotoForUpload';

const API_URL = 'https://dm-developpement.fr/moodify';

const MOOD_PAYLOAD = JSON.stringify({
  type: 'image',
  humor: '',
  id: '',
  username: '',
  password: '',
});

type SendPhotoOptions = {
  mimeType?: string | null;
  fileName?: string | null;
};

/**
 * Sends a photo to the mood detection API and returns the raw API response.
 * Uses uploadAsync (multipart natif) — plus fiable que fetch+FormData sur Android/MIUI.
 */
export async function sendPhoto(
  photoUri: string,
  options: SendPhotoOptions = {},
): Promise<unknown> {
  const file = await preparePhotoForUpload(photoUri, options.mimeType, options.fileName);

  const result = await FileSystem.uploadAsync(`${API_URL}/data`, file.uri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'image',
    mimeType: file.type,
    parameters: { data: MOOD_PAYLOAD },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Mood API error ${result.status}: ${result.body}`);
  }

  try {
    return JSON.parse(result.body);
  } catch {
    throw new Error('Mood API error invalid_json');
  }
}
