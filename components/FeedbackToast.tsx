import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#16161A';
const ACCENT = '#00F0F0';
const TEXT = '#FAFAFA';
const TEXT_MUT = 'rgba(255,255,255,0.65)';
const BORDER_S = 'rgba(255,255,255,0.08)';
const ERROR_ICON = '#FF6B6B';

export type FeedbackType = 'error' | 'success' | 'info';

type FeedbackToastProps = {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onDismiss: () => void;
};

const ICONS: Record<FeedbackType, keyof typeof Ionicons.glyphMap> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
};

const ICON_COLORS: Record<FeedbackType, string> = {
  error: ERROR_ICON,
  success: ACCENT,
  info: ACCENT,
};

export function FeedbackToast({
  visible,
  type,
  title,
  message,
  onDismiss,
}: FeedbackToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 16) + 8,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          type === 'error' && styles.cardError,
          type === 'success' && styles.cardSuccess,
        ]}
      >
        <Ionicons
          name={ICONS[type]}
          size={22}
          color={ICON_COLORS[type]}
          style={styles.icon}
        />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityLabel="Fermer le message"
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={18} color={TEXT_MUT} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_S,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  cardError: {
    borderColor: 'rgba(255,107,107,0.35)',
  },
  cardSuccess: {
    borderColor: 'rgba(0,240,240,0.25)',
  },
  icon: {
    marginTop: 1,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUT,
  },
  closeBtn: {
    padding: 4,
  },
});
