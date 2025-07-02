import axios from 'axios';

// Récupérer un token d'accès Spotify
async function getSpotifyAccessToken() {
  const clientId = '638093ee58804e048c23d1b68164f63a';
  const clientSecret = '8c870728ac894e68a92ed6dbb3a5f6a6';
  const authUrl = 'https://accounts.spotify.com/api/token';

  const response = await axios.post(authUrl, null, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    params: {
      grant_type: 'client_credentials',
    },
  });
  console.log(response);

  return response.data.access_token;
}

// Rechercher une playlist basée sur une humeur
export async function fetchPlaylistByMood(mood: string) {
  const token = await getSpotifyAccessToken();
  const searchUrl = 'https://api.spotify.com/v1/search';

  const response = await axios.get(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: mood,
      type: 'playlist',
      limit: 1, // Nombre de playlists à récupérer
    },
  });

  console.log('fetchPlaylistByMood response',response.data);

  return response.data.playlists.items; // Retourne les playlists
}
