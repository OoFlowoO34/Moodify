import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCoverUri } from '@/hooks/useCoverUri';

const ACCENT = '#00F0F0';
const TEXT_MUT = 'rgba(255,255,255,0.60)';
const BORDER_S = 'rgba(255,255,255,0.06)';

type TrackArtworkProps = {
  /** R2 URL of the MP3 — cover is extracted automatically from ID3 tags */
  url?: string;
  size?: number;
  borderRadius?: number;
  active?: boolean;
};

export function TrackArtwork({
  url,
  size = 48,
  borderRadius = 10,
  active = false,
}: TrackArtworkProps) {
  const coverUri = useCoverUri(url);

  const source: { uri: string } | null = coverUri != null ? { uri: coverUri } : null;

  if (source != null) {
    return (
      <Image
        source={source}
        style={[
          styles.cover,
          { width: size, height: size, borderRadius },
          active && styles.coverActive,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius },
        active && styles.placeholderActive,
      ]}
    >
      <Ionicons name="musical-note" size={size * 0.35} color={active ? ACCENT : TEXT_MUT} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: 'rgba(0,240,240,0.08)',
    borderWidth: 1,
    borderColor: BORDER_S,
  },
  coverActive: {
    borderColor: 'rgba(0,240,240,0.35)',
  },
  placeholder: {
    backgroundColor: 'rgba(0,240,240,0.08)',
    borderWidth: 1,
    borderColor: BORDER_S,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderActive: {
    borderColor: 'rgba(0,240,240,0.35)',
  },
});
