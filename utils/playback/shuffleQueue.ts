import type { MusicTrack } from '@/contexts/MusicContext';

/** Returns a shuffled copy of the track list using the Fisher–Yates algorithm. */
export function shuffleTracks(list: MusicTrack[]): MusicTrack[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** File aléatoire avec le morceau demandé en tête, le reste mélangé. */
export function buildShuffledQueue(
  list: MusicTrack[],
  startTrackId?: string | null
): MusicTrack[] {
  if (list.length === 0) return [];
  if (!startTrackId) return shuffleTracks(list);

  const start = list.find((t) => t.id === startTrackId);
  if (!start) return shuffleTracks(list);

  const rest = shuffleTracks(list.filter((t) => t.id !== startTrackId));
  return [start, ...rest];
}

/** Morceau aléatoire différent du morceau actuel. */
export function pickRandomOther(
  list: MusicTrack[],
  excludeId?: string | null
): MusicTrack | null {
  const pool = excludeId ? list.filter((t) => t.id !== excludeId) : list;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
