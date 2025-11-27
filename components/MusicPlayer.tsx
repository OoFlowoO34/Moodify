import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useMusicContext } from '@/contexts/MusicContext';

const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, setIsPlaying } = useMusicContext();

  const openSpotifyUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        setIsPlaying(!isPlaying);
      } else {
        // Si Spotify n'est pas installé, ouvrir dans le navigateur web
        const webUrl = url.replace('spotify:', 'https://open.spotify.com/');
        await Linking.openURL(webUrl);
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du lien Spotify:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Spotify');
    }
  };

  if (!currentTrack) {
    return (
      <View style={styles.musicPlayerContainer}>
        <View style={styles.noTrackContainer}>
          <Text style={styles.noTrackText}>Aucune musique sélectionnée</Text>
          <Text style={styles.noTrackSubtext}>Sélectionnez une musique dans la liste</Text>
        </View>
      </View>
    );
  }
  // Barre de progression factice (statique)
  const fakeProgress = 0.4; // 40% de progression

  return (
    <View style={styles.musicPlayerContainer}>
      <View style={styles.trackInfo}>
        <View style={styles.textContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.titre}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artiste}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => openSpotifyUrl(currentTrack.url)}
        >          
          <Text style={styles.playButtonText}>
            {isPlaying ? '❚❚' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Barre de progression factice */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${fakeProgress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  musicPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100, // Augmenté de 80 à 100 pour plus d'espace
    backgroundColor: '#00F0F0', // Fond bleu cyan
    borderTopWidth: 2,
    borderTopColor: '#ffffff', // Bordure blanche pour contraster
    paddingHorizontal: 20, // Augmenté de 15 à 20
    paddingVertical: 15, // Augmenté de 10 à 15
    justifyContent: 'space-between', // Changé de center à space-between
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  // État sans musique sélectionnée
  noTrackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10, // Ajout de padding vertical
  },
  noTrackText: {
    color: '#ffffff', // Texte blanc sur fond bleu
    fontSize: 17, // Légèrement augmenté
    fontWeight: 'bold',
    // textShadowColor: 'rgba(0, 0, 0, 0.8)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 3,
  },
  noTrackSubtext: {
    color: '#e6f7ff', // Blanc légèrement teinté
    fontSize: 13, // Légèrement augmenté
    marginTop: 6, // Augmenté de 4 à 6
    // textShadowColor: 'rgba(0, 0, 0, 0.6)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 2,
  },
  // État avec musique sélectionnée
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, // Espace entre les infos et la barre de progression
  },
  textContainer: {
    flex: 1,
    marginRight: 20, // Augmenté de 15 à 20 pour plus d'espace
  },
  trackTitle: {
    color: '#ffffff', // Texte blanc sur fond bleu
    fontSize: 17, // Légèrement augmenté
    fontWeight: 'bold',
    marginBottom: 6, // Augmenté de 4 à 6
  },
  trackArtist: {
    color: '#e6f7ff', // Blanc légèrement teinté pour l'artiste
    fontSize: 15, // Légèrement augmenté
  },
  playButton: {
    backgroundColor: '#ffffff', // Bouton blanc sur fond bleu
    width: 55, // Légèrement plus grand
    height: 55, // Légèrement plus grand
    borderRadius: 27.5, // Ajusté pour la nouvelle taille
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',


    shadowOpacity: 0.3, // Plus d'opacité pour l'ombre
    shadowRadius: 5, // Rayon d'ombre augmenté
    elevation: 6, // Elevation augmentée
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 240, 0.3)',
  },
  playButtonText: {
    fontSize: 22, // Légèrement plus grand
    color: '#00F0F0', // Icône bleu cyan sur bouton blanc
    textAlign: 'center',
    lineHeight: 24, // Ajusté pour la nouvelle taille
    includeFontPadding: false,
  },
  progressBarContainer: {
    height: 8, // Augmenté de 6 à 8
    width: '100%',
    backgroundColor: 'rgba(230, 247, 255, 0.6)', // Plus transparent
    borderRadius: 4, // Augmenté de 3 à 4
    overflow: 'hidden',
    marginTop: 5, // Ajout d'une marge en haut
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4, // Ajusté
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  musicPlayerText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MusicPlayer;