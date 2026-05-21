import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const ACCENT = '#00F0F0';
const BAR_COUNT = 48;
const BAR_WIDTH = 3;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 18;
const CYCLE_MS = 1000;

/** Rayon du cercle logo (entry: 280px → 140) + marge avant les barres */
export const CIRCLE_RADIUS = 140;
const RING_GAP = 10;

type WaveBarProps = {
  index: number;
  size: number;
  radius: number;
  phase: SharedValue<number>;
};

function WaveBar({ index, size, radius, phase }: WaveBarProps) {
  const angleDeg = (index / BAR_COUNT) * 360;
  const pivot = size / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const wave = 0.15 + 0.85 * Math.abs(Math.sin(phase.value + index * 0.42));
    const height = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * wave;
    return {
      height,
      top: -(radius + height),
      opacity: 0.2 + wave * 0.8,
    };
  });

  return (
    <View
      style={[
        styles.pivot,
        {
          left: pivot,
          top: pivot,
          transform: [{ rotate: `${angleDeg}deg` }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            left: -BAR_WIDTH / 2,
            width: BAR_WIDTH,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

type CircularWaveformProps = {
  size?: number;
  circleRadius?: number;
};

export function CircularWaveform({
  size = 340,
  circleRadius = CIRCLE_RADIUS,
}: CircularWaveformProps) {
  const barRadius = circleRadius + RING_GAP;
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: CYCLE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [phase]);

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <WaveBar key={i} index={i} size={size} radius={barRadius} phase={phase} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  pivot: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  bar: {
    position: 'absolute',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
});
