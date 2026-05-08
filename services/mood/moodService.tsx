import axios from 'axios';
import { Alert } from 'react-native';
const API_URL = __DEV__ ? 'https://dm-developpement.fr/moodify' : 'https://my-json-server.typicode.com/OoFlowoO34/mockjson';

export interface FormattedMusicTrack {
  artiste: string;
  titre: string;
  url: string;
}

function parsePlaylist(rawPlaylist: unknown): Array<{ name?: string; artist?: string; url?: string }> {
  if (Array.isArray(rawPlaylist)) {
    return rawPlaylist;
  }

  if (typeof rawPlaylist !== 'string') {
    return [];
  }

  const trimmedPlaylist = rawPlaylist.trim();
  if (!trimmedPlaylist) {
    return [];
  }

  try {
    return JSON.parse(trimmedPlaylist);
  } catch (firstError) {
    try {
      return JSON.parse(trimmedPlaylist.replace(/\\"/g, '"'));
    } catch (secondError) {
      console.error('Impossible de parser la playlist reçue:', secondError ?? firstError);
      return [];
    }
  }
}

export function formatPlaylistResponse(apiResponse: any): {
  humor: string | null;
  playlist: FormattedMusicTrack[];
} {
  const parsedPlaylist = parsePlaylist(apiResponse?.playlist);

  return {
    humor: typeof apiResponse?.humor === 'string' ? apiResponse.humor : null,
    playlist: parsedPlaylist.map((track) => ({
      titre: track.name ?? '',
      artiste: track.artist ?? '',
      url: track.url ?? '',
    })),
  };
}

// Récupérer un token d'accès Spotify
export async function getMusicListByMood2(selectedMood: string){
  console.log('Humeur sélectionné:', selectedMood);
  const mood = selectedMood
 try {
    const response = await axios.post(API_URL + "/data", {
      //id: 'VlEVsGG9kEadaYQN3Vp1wD0wVj83', // ID utilisateur fictif
      id: '5gWdEvbq9cQr0QxgYasIwfwaxI33', // ID utilisateur fictif
      type: 'text',
      humor: mood, // l'humeur sélectionnée par l'utilisateur
    });
    console.log('Réponse de l\'API:', response.data);

    // Axios renvoie directement les données dans response.data
    return response.data; // La réponse contient la playlist basée sur l'humeur
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'humeur:', error);
    throw error;
  }
};

export async function getMusicListByMood(selectedMood: string) {
  console.log('Humeur sélectionnée:', selectedMood);

  try {
    const formData = new FormData();

    // 👇 JSON string comme dans Postman
    const data = {
      type: 'text',
      humor: selectedMood,
      id: '5gWdEvbq9cQr0QxgYasIwfwaxI33',
      username: 'dorian.figueras1207@gmail.com',
      password: 'password'
    };

    // 🔥 Très important : .append('data', JSON.stringify(data))
    formData.append('data', JSON.stringify(data));

    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      body: formData,
      // ❌ NE PAS mettre 'Content-Type': 'multipart/form-data'
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Réponse non OK:', text);
      throw new Error('Erreur lors de l’envoi de l’humeur');
    }
    console.log('Réponse de l\'API response:', response);

    const responseData = await response.json();
    console.log('Réponse de l\'API:', responseData);
    return responseData;

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'humeur:', error);
    throw error;
  }
}




export async function getMusicListByImage(photoUri: string) {
  try {
    const formData = new FormData();
    formData.append('type', 'image');
    formData.append('id', '5gWdEvbq9cQr0QxgYasIwfwaxI33');
    formData.append('image', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l’envoi de la photo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur API (image):', error);
    throw error;
  }
}

interface Photo {
  uri: string;
  base64?: string;
  width?: number;
  height?: number;
}

// export async function sendPhoto(photoUri: string){
//   try {
//     console.log('Envoi de la photo avec sendPhoto ( service ):', photoUri);
//     // Télécharger l'image pour la convertir en Blob
//     const response = await fetch(photoUri);
//     const blob = await response.blob();

//     const formData = new FormData();

//     const filename = photoUri.split('/').pop() || 'image.jpg';  // Assurer un nom de fichier par défaut

//     formData.append('image', blob, filename);

//     console.log('Envoi de la photo à l\'API:', formData);

//     const responseApi = await axios.post(API_URL + "/data", formData, {
//       headers: {
//         id: '5gWdEvbq9cQr0QxgYasIwfwaxI33',
//       },
//     });
 
//     if (responseApi.status === 200) {
//       console.log('Réponse de l\'API:', responseApi.data);
//       Alert.alert('Succès', 'Image envoyée et traitée avec succès!');
//     } else {
//       console.error('Erreur API:', responseApi.data);
//       Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'image.');
//     }
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi de la photo:', error);
//     Alert.alert('Erreur', 'Impossible d\'envoyer la photo');
//   }
// };

export async function sendPhoto(photoUri: string) {
  try {
    console.log('Préparation de la requête FormData...');

    const formData = new FormData();

    // Objet JSON sous forme de string, dans le champ "data"
    const data = {
      type: 'image',
      humor: 'happy', // ← ajoute le champ "humor"
      id: '5gWdEvbq9cQr0QxgYasIwfwaxI33',
      username: 'dorian.figueras1207@gmail.com',
      password: 'password',
    };

    formData.append('data', JSON.stringify(data));

    formData.append('image', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any); // cast pour React Native

    console.log('FormData prêt, envoi de la requête...');

    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      body: formData,
      // Ne PAS mettre de Content-Type → fetch le gère pour multipart/form-data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', errorText);
      throw new Error('Erreur lors de l’envoi de l’image');
    }

    const responseData = await response.json();
    console.log('Réponse reçue :', responseData);
    return responseData;

  } catch (error) {
    console.error('Erreur lors de l’envoi de l\'image via FormData :', error);
    throw error;
  }
}
