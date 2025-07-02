import axios from 'axios';
const API_URL = __DEV__ ? 'https://developpement.tech/moodify' : 'https://my-json-server.typicode.com/OoFlowoO34/mockjson';

// Récupérer un token d'accès Spotify
export async function getMusicListByMood(selectedMood: string){
  console.log('Humeur sélectionné:', selectedMood);
  const mood = selectedMood
 try {
    const response = await axios.post(API_URL + "/data", {
      id: 'VlEVsGG9kEadaYQN3Vp1wD0wVj83', // ID utilisateur fictif
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