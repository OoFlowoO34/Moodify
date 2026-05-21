import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useMusicContext } from '@/contexts/MusicContext';
import { Ionicons } from '@expo/vector-icons';

const SURF = '#1A1A1F';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER_S = 'rgba(255,255,255,0.06)';
const BORDER_ACCENT = 'rgba(0,240,240,0.16)';

const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, setIsPlaying } = useMusicContext();

  const openSpotifyUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setIsPlaying(!isPlaying);
      } else {
        const webUrl = url.replace('spotify:', 'https://open.spotify.com/');
        await Linking.openURL(webUrl);
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien Spotify');
    }
  };

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={18} color={TEXT_DIM} />
          <View>
            <Text style={styles.emptyTitle}>Aucune musique sélectionnée</Text>
            <Text style={styles.emptySubtitle}>Sélectionnez un morceau dans la liste</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Track info + play button */}
      <View style={styles.trackRow}>
        {/* Album art placeholder */}
        <View style={styles.albumArt}>
          <Ionicons name="musical-note" size={16} color={ACCENT} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.titre}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artiste}</Text>
        </View>

        {/* Play button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => openSpotifyUrl(currentTrack.url)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={SURF}
          />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: SURF,
    borderTopWidth: 1,
    borderTopColor: BORDER_ACCENT,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    justifyContent: 'space-between',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  emptyState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: TEXT_MUT,
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtitle: {
    color: TEXT_DIM,
    fontSize: 12,
    marginTop: 2,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  albumArt: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,240,240,0.12)',
    borderWidth: 1,
    borderColor: BORDER_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    color: TEXT_MUT,
    fontSize: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: TEXT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTrack: {
    height: 2,
    backgroundColor: BORDER_S,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default MusicPlayer;
