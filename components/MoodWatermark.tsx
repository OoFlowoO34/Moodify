import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { MOOD_LOGO_SOURCES } from '@/constants/moodLogos';
import { normalizeMood } from '@/services/mood/localPlaylistService';

const BG = '#0D0D0F';

type MoodWatermarkProps = {
  /** Humeur brute (Happy, sad, neutral…). */
  mood: string;
  /** Coin où le logo déborde partiellement hors écran. */
  corner?: 'top-right' | 'top-left';
};

function resolveSource(mood: string): ImageSourcePropType {
  return MOOD_LOGO_SOURCES[normalizeMood(mood)];
}

/**
 * Filigrane décoratif : logo penché, partiellement hors champ,
 * voile couleur fond pour ne pas gêner lecture ni interactions.
 */
export function MoodWatermark({ mood, corner = 'top-right' }: MoodWatermarkProps) {
  const source = resolveSource(mood);
  const isRight = corner === 'top-right';
  const rotation = isRight ? '24deg' : '-20deg';

  return (
    <View
      style={[styles.root, isRight ? styles.rootRight : styles.rootLeft]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.slot, isRight ? styles.slotRight : styles.slotLeft]}>
        <Image
          source={source}
          style={[styles.image, { transform: [{ rotate: rotation }] }]}
          resizeMode="contain"
        />
        <View style={styles.veil} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    zIndex: 0,
    overflow: 'hidden',
  },
  rootRight: {
    alignItems: 'flex-end',
  },
  rootLeft: {
    alignItems: 'flex-start',
  },
  slot: {
    width: 300,
    height: 300,
    marginTop: 0,
  },
  slotRight: {
    marginRight: 0,
  },
  slotLeft: {
    marginLeft: -95,
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.28,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    opacity: 0.78,
  },
});
