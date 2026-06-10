// Mood detection API — submits a photo and returns the detected humor + metadata.
// Playlist resolution from the API response is handled by localPlaylistService.

const API_URL = 'https://dm-developpement.fr/moodify';

/**
 * Sends a photo to the mood detection API and returns the raw API response.
 * The caller is responsible for resolving the playlist via resolvePlaylistFromApiResponse().
 *
 * Note: fetch handles the multipart/form-data boundary automatically — do not set Content-Type manually.
 */
export async function sendPhoto(photoUri: string): Promise<unknown> {
  const formData = new FormData();
  console.log('Sending photo to mood API:', photoUri);

  formData.append('data', JSON.stringify({     type: 'image',
    humor: '',
    id: '',
    username: '',
    password: '',
 }));

  formData.append('image', {
    uri: photoUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch(`${API_URL}/data`, {
    method: 'POST',
    body: formData,
  });

  console.log('Mood API response:', response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mood API error ${response.status}: ${errorText}`);
  }

  return response.json();
}
