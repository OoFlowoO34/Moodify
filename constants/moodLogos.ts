import type { ImageSourcePropType } from 'react-native';
import type { MoodKey } from '@/assets/audio/manifest';

export const MOOD_LOGO_SOURCES: Record<MoodKey, ImageSourcePropType> = {
  happy: require('@/assets/images/moodify_logo_happy.png'),
  sad: require('@/assets/images/moodify_logo_sad.png'),
  neutral: require('@/assets/images/moodify_logo.png'),
};

/** Logo penché pour filigrane générique (caméra sans humeur choisie). */
export const MOODIFY_BRAND_TILTED = require('@/assets/images/logo-tilted-right.png');
