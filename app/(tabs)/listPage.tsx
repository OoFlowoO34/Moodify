import React, { useEffect, useRef } from 'react';
import {
  Text, StyleSheet, View, FlatList, TouchableOpacity, Animated,
} from 'react-native';
import { useMusicContext, MusicTrack } from '@/contexts/MusicContext';
import NavBar from '@/components/NavBar';
import MusicPlayer from '@/components/MusicPlayer';
import { TrackArtwork } from '@/components/TrackArtwork';
import { MoodWatermark } from '@/components/MoodWatermark';
import { Ionicons } from '@expo/vector-icons';

const BG = '#0D0D0F';
const SURF = '#1A1A1F';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER = 'rgba(0,240,240,0.16)';
const BORDER_S = 'rgba(255,255,255,0.06)';

const MOOD_LABELS: Record<string, { fr: string; copy: string }> = {
  happy:    { fr: 'Joyeux',        copy: 'Sons solaires pour amplifier ton énergie.' },
  Happy:    { fr: 'Joyeux',        copy: 'Sons solaires pour amplifier ton énergie.' },
  sad:      { fr: 'Mélancolique',  copy: 'Une bande-son douce pour les jours bleus.' },
  neutral:  { fr: 'Serein',        copy: 'Notes posées pour garder la cadence.' },
  energetic:{ fr: 'Énergique',     copy: 'Tempo élevé, rythme assumé.' },
};

export default function ListPageScreen() {
  const {
    musicList,
    selectedMood,
    isLoading,
    currentTrack,
    shuffleEnabled,
    playTrack,
    playRandom,
    toggleShuffle,
  } = useMusicContext();

  const skeletonOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isLoading) {
      skeletonOpacity.setValue(0.3);
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
          Animated.timing(skeletonOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => { pulse.stop(); pulse.reset(); };
    } else {
      skeletonOpacity.setValue(1);
    }
  }, [isLoading]);

  const mood = selectedMood ? MOOD_LABELS[selectedMood] : null;
  const moodLabel = mood?.fr ?? selectedMood ?? 'Humeur';
  const moodCopy = mood?.copy ?? 'Morceaux sélectionnés pour toi.';

  const renderTrack = ({ item }: { item: MusicTrack }) => {
    const isActive = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isActive && styles.trackItemActive]}
        onPress={() => playTrack(item)}
        activeOpacity={0.7}
      >
        <TrackArtwork
          url={item.url}
          size={48}
          borderRadius={10}
          active={isActive}
        />

        {/* Track info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.titre}
            {isActive && <Text style={styles.nowPlayingDot}>  ● en cours</Text>}
          </Text>
          {!!item.artiste?.trim() && (
            <Text style={styles.trackArtist} numberOfLines={1}>{item.artiste}</Text>
          )}
        </View>

        <Ionicons name="ellipsis-vertical" size={18} color={TEXT_DIM} />
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonItem}>
      <Animated.View style={[styles.skeletonArt, { opacity: skeletonOpacity }]} />
      <View style={styles.skeletonText}>
        <Animated.View style={[styles.skeletonTitle, { opacity: skeletonOpacity }]} />
        <Animated.View style={[styles.skeletonArtist, { opacity: skeletonOpacity }]} />
      </View>
      <Animated.View style={[styles.skeletonIcon, { opacity: skeletonOpacity }]} />
    </View>
  );

  const ListHeader = () => (
    <View style={styles.listHeader}>
      {/* Mood word */}
      <Text style={styles.moodLabel}>HUMEUR DÉTECTÉE</Text>
      {isLoading ? (
        <Animated.View style={[styles.skeletonMoodWord, { opacity: skeletonOpacity }]} />
      ) : (
        <Text style={styles.moodWord}>{moodLabel}<Text style={styles.moodWordPeriod}>.</Text></Text>
      )}
      {!isLoading && (
        <Text style={styles.moodCopy}>
          {musicList.length} morceaux · {moodCopy}
        </Text>
      )}

      {/* Play-all row */}
      {!isLoading && musicList.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.playAllButton}
            activeOpacity={0.85}
            onPress={playRandom}
          >
            <Ionicons name="play" size={18} color="#0A0B33" />
            <Text style={styles.playAllText}>Lecture aléatoire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={20} color={TEXT} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, shuffleEnabled && styles.iconButtonActive]}
            onPress={toggleShuffle}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shuffle"
              size={20}
              color={shuffleEnabled ? '#0A0B33' : TEXT}
            />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionLabel}>MORCEAUX</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {selectedMood ? <MoodWatermark mood={selectedMood} corner="top-right" /> : null}

      {/* Mood wash gradient (simulated with a View) */}
      <View style={styles.moodWash} />

      <FlatList
        style={styles.list}
        data={isLoading ? (Array(7).fill(null) as any[]) : musicList}
        keyExtractor={(item, index) => isLoading ? `sk-${index}` : item?.id ?? `track-${index}`}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.scrollContent}
        renderItem={isLoading ? renderSkeleton : renderTrack}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={TEXT_DIM} />
              <Text style={styles.emptyText}>
                {selectedMood
                  ? `Aucun morceau pour « ${moodLabel} ». Ajoutez des MP3 dans assets/audio/ (voir README).`
                  : 'Allez sur l\'onglet Caméra pour détecter votre humeur'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Mini player — sits above bottom nav */}
      <View style={styles.playerContainer}>
        <MusicPlayer />
      </View>

      {/* Floating bottom nav */}
      <NavBar active="list" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  list: {
    flex: 1,
    zIndex: 1,
  },
  moodWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: 'rgba(0,240,240,0.10)',
    zIndex: 0,
  },
  scrollContent: {
    paddingBottom: 210,
    paddingTop: 60,
  },
  // List header
  listHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  moodLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: ACCENT,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  moodWord: {
    fontSize: 52,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: -2,
    lineHeight: 54,
  },
  moodWordPeriod: {
    color: TEXT,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  skeletonMoodWord: {
    height: 54,
    width: '60%',
    backgroundColor: SURF,
    borderRadius: 8,
    marginBottom: 8,
  },
  moodCopy: {
    fontSize: 14,
    color: TEXT_MUT,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0B33',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: TEXT_DIM,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Track items
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trackItemActive: {
    backgroundColor: SURF,
    borderColor: BORDER,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  nowPlayingDot: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '400',
  },
  trackArtist: {
    fontSize: 13,
    color: TEXT_MUT,
  },
  // Skeletons
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 16,
  },
  skeletonArt: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: SURF,
  },
  skeletonText: {
    flex: 1,
    gap: 8,
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    backgroundColor: SURF,
    borderRadius: 4,
  },
  skeletonArtist: {
    height: 12,
    width: '45%',
    backgroundColor: '#22222A',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 18,
    height: 18,
    backgroundColor: SURF,
    borderRadius: 4,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    color: TEXT_MUT,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Player + nav layout
  playerContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 88,
    zIndex: 20,
  },
});
