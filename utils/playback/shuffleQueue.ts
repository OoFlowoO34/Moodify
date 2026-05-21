import type { MusicTrack } from '@/contexts/MusicContext';

/** Mélange une copie de la liste (Fisher–Yates) */
export function shuffleTracks(list: MusicTrack[]): MusicTrack[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
