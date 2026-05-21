import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useMusicContext } from '@/contexts/MusicContext';
import { TrackArtwork } from '@/components/TrackArtwork';
import { SeekableProgressBar } from '@/components/SeekableProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback, UserFacingError } from '@/contexts/FeedbackContext';

const SURF = '#1A1A1F';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const TEXT_DIM = 'rgba(255,255,255,0.40)';
const BORDER_ACCENT = 'rgba(0,240,240,0.16)';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    playNext,
    playPrevious,
    canPlayPrevious,
    canPlayNext,
    togglePlayPause,
    canPlayCurrent,
    playbackProgress,
    playbackPosition,
    playbackDuration,
    didJustFinish,
    playQueue,
    seekTo,
  } = useMusicContext();
  const { showError } = useFeedback();

  const lastFinishedId = useRef<string | null>(null);
  const [scrubPosition, setScrubPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!didJustFinish || !currentTrack) return;
    if (lastFinishedId.current === currentTrack.id) return;
    lastFinishedId.current = currentTrack.id;
    if (canPlayNext) {
      playNext();
    }
  }, [didJustFinish, currentTrack, canPlayNext, playNext]);

  useEffect(() => {
    if (isPlaying) {
      lastFinishedId.current = null;
    }
  }, [isPlaying, currentTrack?.id]);

  useEffect(() => {
    setScrubPosition(null);
  }, [currentTrack?.id]);

  const openExternalUrl = async (url: string) => {
    try {
      const webUrl = url.startsWith('http') ? url : url.replace('spotify:', 'https://open.spotify.com/');
      await Linking.openURL(webUrl);
    } catch {
      showError(
        new UserFacingError('Lecture impossible', 'Impossible d\'ouvrir ce lien.')
      );
    }
  };

  const handlePlayPress = async () => {
    if (!currentTrack) return;

    if (canPlayCurrent) {
      togglePlayPause();
      return;
    }

    if (currentTrack.url) {
      await openExternalUrl(currentTrack.url);
      return;
    }

    showError(
      new UserFacingError(
        'Morceau indisponible',
        'Ajoutez le fichier MP3 et enregistrez-le dans assets/audio (voir README).'
      )
    );
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

  const showProgress = canPlayCurrent && playbackDuration > 0;
  const displayPosition = scrubPosition ?? playbackPosition;

  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        <TrackArtwork url={currentTrack.url} size={36} borderRadius={8} active />

        <View style={styles.textContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.titre}</Text>
          {!!currentTrack.artiste?.trim() && (
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artiste}</Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.skipButton, !canPlayPrevious && styles.skipButtonDisabled]}
            onPress={playPrevious}
            disabled={!canPlayPrevious || playQueue.length < 2}
            activeOpacity={0.7}
            accessibilityLabel="Morceau précédent"
          >
            <Ionicons
              name="play-skip-back"
              size={22}
              color={canPlayPrevious ? TEXT : TEXT_DIM}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPress}
            activeOpacity={0.8}
            accessibilityLabel={isPlaying ? 'Pause' : 'Lecture'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={SURF}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipButton, !canPlayNext && styles.skipButtonDisabled]}
            onPress={playNext}
            disabled={!canPlayNext || playQueue.length < 2}
            activeOpacity={0.7}
            accessibilityLabel="Morceau suivant"
          >
            <Ionicons
              name="play-skip-forward"
              size={22}
              color={canPlayNext ? TEXT : TEXT_DIM}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressRow}>
        {showProgress ? (
          <SeekableProgressBar
            progress={playbackProgress}
            duration={playbackDuration}
            onSeek={(seconds) => {
              setScrubPosition(seconds);
              seekTo(seconds);
            }}
            onScrubEnd={() => setScrubPosition(null)}
          />
        ) : (
          <View style={styles.progressTrackPlaceholder} />
        )}
        {showProgress && (
          <Text style={styles.timeText}>
            {formatTime(displayPosition)} / {formatTime(playbackDuration)}
          </Text>
        )}
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
    marginBottom: 6,
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonDisabled: {
    opacity: 0.35,
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
  progressRow: {
    gap: 4,
  },
  progressTrackPlaceholder: {
    height: 24,
  },
  timeText: {
    fontSize: 10,
    color: TEXT_DIM,
    textAlign: 'right',
  },
});

export default MusicPlayer;
