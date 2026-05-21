import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';

const ACCENT = '#00F0F0';
const BORDER_S = 'rgba(255,255,255,0.06)';

type SeekableProgressBarProps = {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onScrubEnd?: () => void;
  disabled?: boolean;
};

export function SeekableProgressBar({
  progress,
  duration,
  onSeek,
  onScrubEnd,
  disabled = false,
}: SeekableProgressBarProps) {
  const barWidthRef = useRef(0);
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const onSeekRef = useRef(onSeek);
  const onScrubEndRef = useRef(onScrubEnd);
  const durationRef = useRef(duration);
  const disabledRef = useRef(disabled);

  onSeekRef.current = onSeek;
  onScrubEndRef.current = onScrubEnd;
  durationRef.current = duration;
  disabledRef.current = disabled;

  const displayProgress = scrubRatio ?? progress;

  const seekFromX = (x: number) => {
    if (disabledRef.current || barWidthRef.current <= 0 || durationRef.current <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / barWidthRef.current));
    setScrubRatio(ratio);
    onSeekRef.current(ratio * durationRef.current);
  };

  const endScrub = () => {
    setScrubRatio(null);
    onScrubEndRef.current?.();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (evt) => seekFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => seekFromX(evt.nativeEvent.locationX),
      onPanResponderRelease: endScrub,
      onPanResponderTerminate: endScrub,
    })
  ).current;

  return (
    <View
      style={styles.hitArea}
      onLayout={(e) => {
        barWidthRef.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Position dans le morceau"
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${displayProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    height: 24,
    justifyContent: 'center',
  },
  track: {
    height: 3,
    backgroundColor: BORDER_S,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
});
