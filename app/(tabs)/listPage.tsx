import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, FlatList, TouchableOpacity, Linking, Alert, Image, Animated } from 'react-native';
import { List, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { useMusicContext, MusicTrack } from '@/contexts/MusicContext';
import NavBar from '@/components/NavBar';
import MusicPlayer from '@/components/MusicPlayer';
import { Ionicons } from '@expo/vector-icons';

export default function TabThreeScreen() {
  const { musicList, selectedMood, isLoading, setCurrentTrack } = useMusicContext();
  
  // Animation du header
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Animation pour les skeletons
  const skeletonOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isLoading) {
      // Réinitialiser la valeur d'opacité
      skeletonOpacity.setValue(0.3);
      
      // Animation pulsante pour les skeletons - plus visible
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 0.8, // Plus de contraste
            duration: 600, // Plus rapide
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.2, // Plus de contraste
            duration: 600, // Plus rapide
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => {
        pulseAnimation.stop();
        pulseAnimation.reset();
      };
    } else {
      // Remettre l'opacité à normale quand le chargement s'arrête
      skeletonOpacity.setValue(1);
    }
  }, [isLoading]);

  const getMoodLogo = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
        return require('@/assets/images/moodify_logo_happy.png');
      case 'sad':
        return require('@/assets/images/moodify_logo_sad.png');
      case 'neutral':
         return require('@/assets/images/moodify_logo.png');      
      default:
        return require('@/assets/images/moodify_logo.png');
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;
    
    // Seuil de déclenchement pour éviter les micro-mouvements
    const threshold = 1;
    
    if (Math.abs(scrollDelta) > threshold) {
      if (scrollDelta > 0 && isHeaderVisible && currentScrollY > 50) {
        // Scroll vers le bas - cacher le header
        setIsHeaderVisible(false);
        Animated.spring(headerTranslateY, {
          toValue: -150, // Cacher complètement le header
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else if (scrollDelta < 0 && !isHeaderVisible) {
        // Scroll vers le haut - montrer le header
        setIsHeaderVisible(true);
        Animated.spring(headerTranslateY, {
          toValue: 0, // Retour à la position normale
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
      
      lastScrollY.current = currentScrollY;
    }
  };


  const renderMusicItem = ({ item }: { item: MusicTrack }) => (
    <TouchableOpacity 
      style={styles.musicItem}
      onPress={() => {
        // Sélectionner la musique dans le MusicPlayer
        setCurrentTrack(item);
        console.log('Musique sélectionnée pour le player:', item.titre, 'par', item.artiste);
      }}
    >
      <List.Item
        title={item.titre}
        description={item.artiste}
        titleStyle={styles.musicTitle}
        descriptionStyle={styles.musicArtist}
        // left={(props) => (
        //   <List.Icon {...props} icon="music-note" color="#1db954" />
        // )}
        right={() => (
          <TouchableOpacity
            style={styles.spotifyButton}
            onPress={(e) => {
              //e.stopPropagation(); // Empêche le déclenchement du onPress du parent
              // D'abord sélectionner la musique
              // setCurrentTrack(item);
              // // Puis ouvrir Spotify
              // openSpotifyUrl(item.url);
            }}
          >
            <Ionicons style={styles.infoButton} name="ellipsis-vertical" size={20} color="#b3b3b3" />
          </TouchableOpacity>
        )}
      />
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );

  const renderSkeletonItem = ({ index }: { index: number }) => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTextContainer}>
          <Animated.View style={[styles.skeletonTitle, { opacity: skeletonOpacity }]} />
          <Animated.View style={[styles.skeletonArtist, { opacity: skeletonOpacity }]} />
        </View>
        <Animated.View style={[styles.skeletonButton, { opacity: skeletonOpacity }]} />
      </View>
      <Divider style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <NavBar />
      
      {/* En-tête avec l'humeur sélectionnée - Animé */}
<Animated.View 
  style={[
    styles.header,
    {
      transform: [{ translateY: headerTranslateY }],
    }
  ]}
>
  <View style={styles.headerContent}>
    {isLoading ? (
      <>
        <Animated.View
          style={[styles.skeletonHeaderText, { opacity: skeletonOpacity }]}
        />
        <Animated.View
          style={[styles.skeletonHeaderImage, { opacity: skeletonOpacity }]}
        />
      </>
    ) : (
      <>
        <Text style={styles.headerTitle}>
          {selectedMood ? `Musiques ${selectedMood}` : 'Sélectionnez une humeur'}
        </Text>
        {selectedMood && (
          <Image
            source={getMoodLogo(selectedMood)}
            style={styles.moodLogo}
            resizeMode="contain"
          />
        )}
      </>
    )}
  </View>
</Animated.View>

      {/* Liste de musique */}
      <FlatList
        data={isLoading ? Array(6).fill(null) : musicList} // Affiche 6 skeletons pendant le chargement
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : `${item.url}-${index}`}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedMood 
                  ? `Aucune musique trouvée pour l'humeur "${selectedMood}"` 
                  : 'Allez sur l\'onglet Caméra pour sélectionner votre humeur'}
              </Text>
              {selectedMood && (
                <Text style={styles.emptySubtext}>
                  Essayez une autre humeur ou réessayez plus tard.
                </Text>
              )}
            </View>
          ) : null
        }
        renderItem={isLoading ? renderSkeletonItem : renderMusicItem}
        showsVerticalScrollIndicator={false}
      />

      {/* Lecteur de musique fixé en bas */}
      <View style={styles.playerContainer}>
        <MusicPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#121212',
  },
  header: {
    borderRadius: 100,
    position: 'absolute',
    top: 110, // Positionné sous la NavBar
    left: 0,
    right: 0,
    backgroundColor: '#00F0F0',
    padding: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  moodLogo: {
    width: 100,
    height: 100,
    transform: [{ rotate: '-30deg' }],
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 140, // Augmenté de 120 à 140 pour le nouveau MusicPlayer de 100px + marge
    paddingTop: 250, // Espace pour le header en position absolue (60px NavBar + 140px header)
  },
  musicItem: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  musicTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    paddingRight: 20, // Ajout d'un padding pour éviter que le texte soit coupé
  },
  musicArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    paddingRight: 20, // Ajout d'un padding pour éviter que le texte soit coupé

  },
  spotifyButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  spotifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  divider: {
    backgroundColor: '#333',
    height: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  playerContainer: {
    borderBlockColor: 'red',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: 'rgb(255, 0, 0)',
    paddingVertical: 10,
    paddingBottom: 20,
    zIndex: 1000, // Assure que le player est au-dessus du contenu
  },
  infoButton: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  // Styles pour les wireframes de chargement (skeletons)
  skeletonItem: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  skeletonTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#444', // Plus clair pour être plus visible
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonArtist: {
    height: 14,
    backgroundColor: '#3a3a3a', // Plus clair pour être plus visible
    borderRadius: 4,
    width: '50%',
  },
  skeletonButton: {
    width: 20,
    height: 20,
    backgroundColor: '#444', // Plus clair pour être plus visible
    borderRadius: 4,
  },
    skeletonHeaderText: {
    height: 24,
    width: '60%',
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
    marginBottom: 10,
  },
  skeletonHeaderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#444',
  },
});