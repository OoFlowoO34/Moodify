type Id3Meta = { title: string | null; artist: string | null; coverUri: string | null };

const metaCache = new Map<string, Id3Meta>();

function parseSynchsafeInt(b: Uint8Array, offset: number): number {
  return (
    ((b[offset] & 0x7f) << 21) |
    ((b[offset + 1] & 0x7f) << 14) |
    ((b[offset + 2] & 0x7f) << 7) |
    (b[offset + 3] & 0x7f)
  );
}

function readCString(b: Uint8Array, offset: number): { value: string; end: number } {
  let end = offset;
  while (end < b.length && b[end] !== 0) end++;
  let value = '';
  for (let i = offset; i < end; i++) value += String.fromCharCode(b[i]);
  return { value, end: end + 1 };
}

function decodeTextFrame(b: Uint8Array, start: number, end: number): string {
  if (start >= end) return '';
  const encoding = b[start];
  const data = b.subarray(start + 1, end);

  let len = data.length;
  if (encoding === 0x01 || encoding === 0x02) {
    while (len >= 2 && data[len - 2] === 0 && data[len - 1] === 0) len -= 2;
  } else {
    while (len > 0 && data[len - 1] === 0) len--;
  }
  const trimmed = data.subarray(0, len);

  if (encoding === 0x03) {
    try { return new TextDecoder('utf-8').decode(trimmed); } catch { /* fall through */ }
  }

  if (encoding === 0x01 || encoding === 0x02) {
    let isBE = encoding === 0x02;
    let i = 0;
    if (trimmed.length >= 2 && trimmed[0] === 0xFF && trimmed[1] === 0xFE) { isBE = false; i = 2; }
    else if (trimmed.length >= 2 && trimmed[0] === 0xFE && trimmed[1] === 0xFF) { isBE = true; i = 2; }
    let str = '';
    for (; i + 1 < trimmed.length; i += 2) {
      const code = isBE
        ? (trimmed[i] << 8) | trimmed[i + 1]
        : trimmed[i] | (trimmed[i + 1] << 8);
      str += String.fromCodePoint(code);
    }
    return str;
  }

  // ISO-8859-1
  let str = '';
  for (let i = 0; i < trimmed.length; i++) str += String.fromCharCode(trimmed[i]);
  return str;
}

function toBase64(data: Uint8Array): string {
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < data.length; i += CHUNK) {
    binary += String.fromCharCode(...data.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

async function parseId3(url: string): Promise<Id3Meta> {
  const result: Id3Meta = { title: null, artist: null, coverUri: null };
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-131071' } });
    if (!res.ok && res.status !== 206) return result;
    const b = new Uint8Array(await res.arrayBuffer());

    if (b[0] !== 0x49 || b[1] !== 0x44 || b[2] !== 0x33) return result;

    const version = b[3];
    const headerFlags = b[5];
    const tagSize = parseSynchsafeInt(b, 6);
    let offset = 10;

    if (headerFlags & 0x40) {
      const extSize = version === 4
        ? parseSynchsafeInt(b, offset)
        : (b[offset] << 24) | (b[offset + 1] << 16) | (b[offset + 2] << 8) | b[offset + 3];
      offset += extSize;
    }

    const tagEnd = Math.min(10 + tagSize, b.length - 10);

    while (offset < tagEnd) {
      const frameId = String.fromCharCode(b[offset], b[offset + 1], b[offset + 2], b[offset + 3]);
      if (frameId === '\0\0\0\0') break;

      const frameSize = version === 4
        ? parseSynchsafeInt(b, offset + 4)
        : (b[offset + 4] << 24) | (b[offset + 5] << 16) | (b[offset + 6] << 8) | b[offset + 7];
      offset += 10;

      if (frameId === 'TIT2' && result.title === null) {
        result.title = decodeTextFrame(b, offset, offset + frameSize) || null;
      } else if (frameId === 'TPE1' && result.artist === null) {
        result.artist = decodeTextFrame(b, offset, offset + frameSize) || null;
      } else if (frameId === 'APIC' && result.coverUri === null) {
        let pos = offset + 1;
        const mime = readCString(b, pos);
        pos = mime.end;
        pos++;
        const desc = readCString(b, pos);
        pos = desc.end;
        const imgData = b.slice(pos, offset + frameSize);
        result.coverUri = `data:${mime.value || 'image/jpeg'};base64,${toBase64(imgData)}`;
      }

      if (result.title && result.artist && result.coverUri) break;
      offset += frameSize;
    }
  } catch { /* return partial result */ }
  return result;
}

export function getCachedMetadata(url: string): Id3Meta | null {
  return metaCache.get(url) ?? null;
}

/**
 * Fetches the first 128 KB of an MP3 URL and extracts title, artist, and cover
 * from the ID3v2 tags (TIT2, TPE1, APIC). Results are cached for the session.
 */
export async function extractId3Metadata(url: string): Promise<Id3Meta> {
  if (metaCache.has(url)) return metaCache.get(url)!;
  const meta = await parseId3(url);
  metaCache.set(url, meta);
  return meta;
}
