import {
  MoodKey,
  PLAYLIST_MANIFEST,
  TrackManifestEntry,
} from '@/assets/audio/manifest';
import type { MusicTrack } from '@/contexts/MusicContext';

const MOOD_ALIASES: Record<string, MoodKey> = {
  happy: 'happy',
  Happy: 'happy',
  HAPPY: 'happy',
  joyful: 'happy',
  joyeux: 'happy',
  sad: 'sad',
  Sad: 'sad',
  SAD: 'sad',
  melancholic: 'sad',
  melancolique: 'sad',
  neutral: 'neutral',
  Neutral: 'neutral',
  NEUTRAL: 'neutral',
  serein: 'neutral',
  calm: 'neutral',
  angry: 'sad',
  energetic: 'happy',
};

export function normalizeMood(raw: string | null | undefined): MoodKey {
  if (!raw || typeof raw !== 'string') return 'neutral';
  const trimmed = raw.trim();
  return MOOD_ALIASES[trimmed] ?? MOOD_ALIASES[trimmed.toLowerCase()] ?? 'neutral';
}

function buildTrack(mood: MoodKey, entry: TrackManifestEntry): MusicTrack {
  return {
    id: entry.id,
    titre: entry.titre,
    artiste: entry.artiste,
    url: entry.url,
    mood,
  };
}

/** Playlist R2 pour une humeur */
export function getLocalPlaylistByMood(rawMood: string): {
  mood: MoodKey;
  playlist: MusicTrack[];
} {
  const mood = normalizeMood(rawMood);
  const entries = PLAYLIST_MANIFEST[mood] ?? [];
  const playlist = entries.map((entry) => buildTrack(mood, entry));
  return { mood, playlist };
}

/** Extrait uniquement l'humeur d'une réponse API (ignore playlist serveur) */
export function extractMoodFromApiResponse(apiResponse: unknown): MoodKey {
  if (!apiResponse || typeof apiResponse !== 'object') {
    return 'neutral';
  }

  const humor = (apiResponse as { humor?: unknown }).humor;
  if (typeof humor === 'string' && humor.trim()) {
    return normalizeMood(humor);
  }

  return 'neutral';
}

/** Humeur API + playlist locale correspondante */
export function resolvePlaylistFromApiResponse(apiResponse: unknown): {
  mood: MoodKey;
  playlist: MusicTrack[];
} {
  const mood = extractMoodFromApiResponse(apiResponse);
  return getLocalPlaylistByMood(mood);
}
