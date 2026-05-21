import { extractId3Metadata } from '@/utils/audio/extractId3Metadata';
import type { MusicTrack } from '@/contexts/MusicContext';

const WORKER_URL = 'https://moodify-api.florianbatt34.workers.dev';

export type MoodKey = 'happy' | 'sad' | 'neutral';

const MOOD_ALIASES: Record<string, MoodKey> = {
  happy: 'happy', Happy: 'happy', HAPPY: 'happy', joyful: 'happy', joyeux: 'happy',
  sad: 'sad', Sad: 'sad', SAD: 'sad', melancholic: 'sad', melancolique: 'sad',
  neutral: 'neutral', Neutral: 'neutral', NEUTRAL: 'neutral', serein: 'neutral', calm: 'neutral',
  angry: 'sad', energetic: 'happy',
};

export function normalizeMood(raw: string | null | undefined): MoodKey {
  if (!raw || typeof raw !== 'string') return 'neutral';
  const trimmed = raw.trim();
  return MOOD_ALIASES[trimmed] ?? MOOD_ALIASES[trimmed.toLowerCase()] ?? 'neutral';
}

function filenameFromUrl(url: string): string {
  const last = url.split('/').pop() ?? '';
  return decodeURIComponent(last).replace(/\.mp3$/i, '');
}

async function fetchTracksFromWorker(mood: MoodKey): Promise<{ id: string; url: string }[]> {
  try {
    const res = await fetch(`${WORKER_URL}/?mood=${mood}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getLocalPlaylistByMood(rawMood: string): Promise<{ mood: MoodKey; playlist: MusicTrack[] }> {
  const mood = normalizeMood(rawMood);
  const rawTracks = await fetchTracksFromWorker(mood);

  const playlist = await Promise.all(
    rawTracks.map(async (track) => {
      const meta = await extractId3Metadata(track.url);
      return {
        id: track.id,
        titre: meta.title ?? filenameFromUrl(track.url),
        artiste: meta.artist ?? '',
        url: track.url,
        mood,
      } satisfies MusicTrack;
    })
  );

  return { mood, playlist };
}

export function extractMoodFromApiResponse(apiResponse: unknown): MoodKey {
  if (!apiResponse || typeof apiResponse !== 'object') return 'neutral';
  const humor = (apiResponse as { humor?: unknown }).humor;
  if (typeof humor === 'string' && humor.trim()) return normalizeMood(humor);
  return 'neutral';
}

export async function resolvePlaylistFromApiResponse(apiResponse: unknown): Promise<{ mood: MoodKey; playlist: MusicTrack[] }> {
  const mood = extractMoodFromApiResponse(apiResponse);
  return getLocalPlaylistByMood(mood);
}
