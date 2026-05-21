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

function toBase64(data: Uint8Array): string {
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < data.length; i += CHUNK) {
    binary += String.fromCharCode(...data.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Fetches only the first 128 KB of an MP3 URL and extracts the embedded
 * cover art from the ID3v2 APIC frame. Returns a data URI or null.
 */
export async function extractCoverFromMp3(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-131071' } });
    if (!res.ok && res.status !== 206) return null;

    const b = new Uint8Array(await res.arrayBuffer());

    // Verify ID3v2 signature
    if (b[0] !== 0x49 || b[1] !== 0x44 || b[2] !== 0x33) return null;

    const version = b[3]; // 3 = ID3v2.3, 4 = ID3v2.4
    const headerFlags = b[5];
    const tagSize = parseSynchsafeInt(b, 6);

    let offset = 10;

    // Skip extended header if present (bit 6 of flags)
    if (headerFlags & 0x40) {
      const extSize =
        version === 4
          ? parseSynchsafeInt(b, offset)
          : (b[offset] << 24) | (b[offset + 1] << 16) | (b[offset + 2] << 8) | b[offset + 3];
      offset += extSize;
    }

    const tagEnd = Math.min(10 + tagSize, b.length - 10);

    while (offset < tagEnd) {
      const frameId = String.fromCharCode(b[offset], b[offset + 1], b[offset + 2], b[offset + 3]);

      if (frameId === '\0\0\0\0') break;

      // Frame size: synchsafe in v2.4, plain big-endian in v2.3
      const frameSize =
        version === 4
          ? parseSynchsafeInt(b, offset + 4)
          : (b[offset + 4] << 24) | (b[offset + 5] << 16) | (b[offset + 6] << 8) | b[offset + 7];

      offset += 10; // skip frame header (4 id + 4 size + 2 flags)

      if (frameId === 'APIC') {
        let pos = offset + 1; // skip text encoding byte
        const mime = readCString(b, pos);
        pos = mime.end;
        pos++; // skip picture type byte
        const desc = readCString(b, pos);
        pos = desc.end;

        const imgData = b.slice(pos, offset + frameSize);
        const mimeType = mime.value || 'image/jpeg';

        return `data:${mimeType};base64,${toBase64(imgData)}`;
      }

      offset += frameSize;
    }

    return null;
  } catch {
    return null;
  }
}
