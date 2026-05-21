import { useEffect, useState } from 'react';
import { extractId3Metadata, getCachedMetadata } from '@/utils/audio/extractId3Metadata';

export function useCoverUri(url?: string): string | null {
  const [coverUri, setCoverUri] = useState<string | null>(() =>
    url != null ? (getCachedMetadata(url)?.coverUri ?? null) : null
  );

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    extractId3Metadata(url).then((meta) => {
      if (!cancelled) setCoverUri(meta.coverUri);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return coverUri;
}
