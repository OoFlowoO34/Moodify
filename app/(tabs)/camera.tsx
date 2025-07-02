import MusicPlayer from '@/components/MusicPlayer';
import NavBar from '@/components/NavBar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, Image } from 'react-native';
import { getMusicListByMood } from "@/services/mood/moodService";
import { useMusicContext } from '@/contexts/MusicContext';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// import {loginWithSpotify} from '../../services/auth/authSpotifyService';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showHumor, setShowHumor] = useState(false); // Contrôle de l'affichage du bouton "Sélectionner une humeur"
  const [humorSelected, setHumorSelected] = useState(''); // Indique si l'humeur a été sélectionnée
  const cameraRef = useRef<CameraView>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { setMusicList, setSelectedMood, setIsLoading } = useMusicContext();
  // const handleLogin = async () => {
  //   try {
  //     // const result = await loginWithSpotify();
  //     // setAccessToken(result.accessToken);
  //     // console.log('Access Token:', result.accessToken);
  //   } catch (error) {
  //     console.error('Erreur lors de la connexion Spotify:', error);
  //   }
  // };

    
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleHumorPress() {
    if(showHumor) {
        setShowHumor(false); // Affiche le bouton "Sélectionner une humeur" lorsque l'utilisateur appuie sur "Humeur"
    }else {
        setShowHumor(true); // Cache le bouton "Sélectionner une humeur" lorsque l'utilisateur appuie sur "Humeur"
    }
}

  async function handleHumorSelection(humor: string) {
    router.push('/(tabs)/listPage');
    console.log(`Humeur sélectionnée : ${humor}`);
    setHumorSelected(humor); // Marque l'humeur comme sélectionnée
    setShowHumor(false); // Cache le bouton "Sélectionner une humeur"
    setSelectedMood(humor);
    setIsLoading(true);
    
    // Vider immédiatement la liste pour éviter d'afficher les anciennes musiques
    setMusicList([]);
    
    try {
      const musicListByMood = await getMusicListByMood(humor);
      // S'assurer que même si l'API retourne null/undefined, on a une liste vide
      const safeList = Array.isArray(musicListByMood) ? musicListByMood : [];
      setMusicList(safeList);
      console.log('Liste de musique chargée:', safeList);
      
    } catch (error) {
      console.error('Erreur lors du chargement de la musique:', error);
      setMusicList([]); // Vider la liste en cas d'erreur aussi
      Alert.alert('Erreur', 'Impossible de charger la musique');
    } finally {
      setIsLoading(false);
    }
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo) {
          console.log('Photo prise:', photo.uri);
          
          // Demander la permission pour accéder à la galerie
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            // Sauvegarder la photo dans la galerie
            const asset = await MediaLibrary.createAssetAsync(photo.uri);
            await MediaLibrary.createAlbumAsync('Moodify', asset, false);
            Alert.alert('Succès', 'Photo sauvegardée dans la galerie !');
            console.log('Photo sauvegardée:', asset);
          } else {
            Alert.alert('Permission refusée', 'Impossible de sauvegarder la photo dans la galerie');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la prise de photo:', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  }

  return (
    <View style={styles.container}>
      <NavBar />
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Boutons en haut de l'écran */}
        <View style={styles.topButtonContainer}>
          <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton} onPress={handleHumorPress}>
            <Image
              source={require('@/assets/images/moodify_logo.png')}
              style={{ width: '80%', height: '80%'}}
            />
          </TouchableOpacity>
        </View>

        {/* Modal de sélection d'humeur */}
        {showHumor && (
          <TouchableOpacity 
            style={styles.humorOverlay}
            activeOpacity={1}
            onPress={() => setShowHumor(false)}
          >
            <TouchableOpacity 
              style={styles.humorModal}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Bouton close positionné dans l'angle */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowHumor(false)}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
              
              <View style={styles.humorHeader}>
                <Text style={styles.humorTitle}>Sélectionnez votre humeur</Text>
              </View>
              <View style={styles.humorContainer}>
                <TouchableOpacity 
                  style={styles.humorButton} 
                  onPress={() => handleHumorSelection('Happy')}
                >
                  <Image
                  source={require('@/assets/images/moodify_logo_happy.png')}
                  style={{ width: '80%', height: '80%'}}
                  />
                  {/* <Text style={styles.humorEmoji}>😀</Text> */}
                  {/* <Text style={styles.humorLabel}>Joyeux</Text> */}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.humorButton} 
                  onPress={() => handleHumorSelection('Sad')}
                >
                  <Image
                  source={require('@/assets/images/moodify_logo_sad.png')}
                  style={{ width: '80%', height: '80%'}}
                  />
                  {/* <Text style={styles.humorEmoji}>😢</Text>
                  <Text style={styles.humorLabel}>Triste</Text> */}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.humorButton} 
                  onPress={() => handleHumorSelection('AI')}
                >
                  <Text style={styles.humorEmoji}>🤖</Text>
                  <Text style={styles.humorLabel}>IA</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.humorButton} 
                  onPress={() => handleHumorSelection('Angry')}
                >
                  <Image
                  source={require('@/assets/images/moodify_logo_angry.png')}
                  style={{ width: '80%', height: '80%'}}
                  />
                  {/* <Text style={styles.humorEmoji}>😡</Text>
                  <Text style={styles.humorLabel}>Furieux</Text> */}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        
        {/* Bouton de capture centré */}
        <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
          <View style={styles.cameraButtonInner}>
            <View style={styles.cameraButtonCenter} />
          </View>
        </TouchableOpacity>
        
        {/* MusicPlayer en bas */}
        <MusicPlayer />

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  // Nouveau container pour les boutons en haut
  topButtonContainer: {
    position: 'absolute',
    top: 110, 
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topButtonText: {
    fontSize: 20,
    color: 'white',
  },
  // Styles pour le modal d'humeur
  humorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  humorModal: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  humorHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10, // Ajoute un peu d'espace en haut pour le bouton close
  },
  humorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -10, // Positionné en dehors de la modal pour être dans l'angle
    top: -10,   // Positionné en dehors de la modal pour être dans l'angle
    zIndex: 30, // Assure qu'il soit au-dessus de tout
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  humorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },
  humorButton: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    margin: 5,
  },
  humorEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  humorLabel: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Bouton de capture
  cameraButton: {
    position: 'absolute',
    bottom: 120, // Position juste au-dessus du MusicPlayer qui fait maintenant 100px de haut
    left: '50%',
    marginLeft: -40, // Centre le bouton (moitié de la largeur 80px)
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
});
