import { useEffect, useState } from 'react';
import { extractCoverFromMp3 } from '@/utils/audio/extractCoverFromMp3';

// Module-level cache — persists for the app session, shared across all components
const cache = new Map<string, string | null>();

/**
 * Extracts and caches the cover art embedded in an MP3 URL (ID3v2 APIC frame).
 * Returns null while loading or if no cover is found.
 */
export function useCoverUri(url?: string): string | null {
  const [uri, setUri] = useState<string | null>(() =>
    url != null && cache.has(url) ? (cache.get(url) ?? null) : null
  );

  useEffect(() => {
    if (!url) return;

    if (cache.has(url)) {
      setUri(cache.get(url) ?? null);
      return;
    }

    let cancelled = false;

    extractCoverFromMp3(url).then((result) => {
      cache.set(url, result);
      if (!cancelled) setUri(result);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return uri;
}
