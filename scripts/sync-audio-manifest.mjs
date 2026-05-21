/**
 * Scanne assets/audio/{Happy,Sad,Neutral}, lit les métadonnées ID3
 * et régénère manifest.ts, audioRegistry.ts, coversRegistry.ts
 *
 * Pochettes (par priorité) :
 * 1. Tag ID3 embarqué dans le MP3
 * 2. Image « sidecar » à côté du MP3 (même nom, .jpg/.jpeg/.png)
 *    → copiée dans covers/ et embarquée dans le MP3 si elle manquait
 *
 * Usage: npm run sync-audio
 */
import { parseFile } from 'music-metadata';
import NodeID3 from 'node-id3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const AUDIO_ROOT = path.join(ROOT, 'assets/audio');
const COVERS_DIR = path.join(AUDIO_ROOT, 'covers');

const MOOD_FOLDERS = [
  { folder: 'Happy', key: 'happy' },
  { folder: 'Sad', key: 'sad' },
  { folder: 'Neutral', key: 'neutral' },
];

const IMAGE_EXTS = ['jpg', 'jpeg', 'png'];

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function fallbackFromFilename(filename) {
  const base = filename.replace(/\.(mp3|m4a|wav)$/i, '').trim();
  const sep = base.indexOf(' - ');
  if (sep > 0) {
    const left = base.slice(0, sep).trim();
    const right = base.slice(sep + 3).trim();
    if (!/^\d+$/.test(left) && right) {
      return { titre: right, artiste: left };
    }
    if (/^\d+$/.test(left) && right) {
      return { titre: right, artiste: '' };
    }
  }
  const titre = base.replace(/^\d+\s*[-.]?\s*/, '').trim() || base;
  return { titre, artiste: '' };
}

function extFromBuffer(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
  return 'jpg';
}

function mimeForExt(ext) {
  return ext === 'png' ? 'image/png' : 'image/jpeg';
}

async function findSidecarImage(dir, audioFile) {
  const base = audioFile.replace(/\.(mp3|m4a|wav)$/i, '');
  for (const ext of IMAGE_EXTS) {
    const candidate = path.join(dir, `${base}.${ext}`);
    try {
      await fs.access(candidate);
      return { path: candidate, ext: ext === 'jpeg' ? 'jpg' : ext };
    } catch {
      /* continue */
    }
  }
  return null;
}

async function writeCoverFile(id, buffer, ext) {
  const coverName = `${id}.${ext}`;
  await fs.writeFile(path.join(COVERS_DIR, coverName), buffer);
  return ext;
}

function embedCoverInMp3(mp3Path, buffer, ext) {
  const mime = mimeForExt(ext);
  const tags = {
    image: {
      mime,
      type: { id: 3, name: 'front cover' },
      description: 'Cover',
      imageBuffer: buffer,
    },
  };
  const ok = NodeID3.update(tags, mp3Path);
  if (!ok) {
    throw new Error(typeof ok === 'object' ? JSON.stringify(ok) : 'node-id3 update failed');
  }
}

async function ensureCoversDir() {
  await fs.mkdir(COVERS_DIR, { recursive: true });
}

async function pruneOrphanCovers(validIds) {
  const existing = await fs.readdir(COVERS_DIR);
  const validNames = new Set(
    validIds.flatMap((id) => IMAGE_EXTS.map((e) => `${id}.${e === 'jpeg' ? 'jpg' : e}`))
  );
  await Promise.all(
    existing
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f) && !validNames.has(f.replace(/\.jpeg$/i, '.jpg')))
      .map((f) => fs.unlink(path.join(COVERS_DIR, f)).catch(() => {}))
  );
}

async function scanMood({ folder, key }) {
  const dir = path.join(AUDIO_ROOT, folder);
  let files;
  try {
    files = (await fs.readdir(dir))
      .filter((f) => /\.(mp3|m4a|wav)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'fr'));
  } catch {
    return [];
  }

  const tracks = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const id = `${key}_${String(i + 1).padStart(2, '0')}`;
    const fullPath = path.join(dir, file);

    let titre = '';
    let artiste = '';
    let coverExt = null;
    let coverSource = null;

    try {
      const { common } = await parseFile(fullPath);
      titre = (common.title || '').trim();
      artiste = (common.artist || common.albumartist || '').trim();
      const picture = common.picture?.[0];
      if (picture?.data?.length) {
        const isPng =
          picture.format?.toLowerCase().includes('png') ||
          picture.data[0] === 0x89;
        coverExt = isPng ? 'png' : 'jpg';
        await writeCoverFile(id, picture.data, coverExt);
        coverSource = 'id3';
      }
    } catch (err) {
      console.warn(`  ⚠ ${folder}/${file} — métadonnées: ${err.message}`);
    }

    if (!coverExt) {
      const sidecar = await findSidecarImage(dir, file);
      if (sidecar) {
        const buffer = await fs.readFile(sidecar.path);
        coverExt = sidecar.ext === 'png' ? 'png' : extFromBuffer(buffer);
        await writeCoverFile(id, buffer, coverExt);
        coverSource = 'sidecar';
        try {
          embedCoverInMp3(fullPath, buffer, coverExt);
          console.log(`  ↳ ${file} — pochette sidecar embarquée dans le MP3`);
        } catch (embedErr) {
          console.warn(`  ⚠ ${file} — sidecar copiée, embed MP3 échoué: ${embedErr.message}`);
        }
      }
    }

    const fallback = fallbackFromFilename(file);
    if (!titre) titre = fallback.titre;
    if (!artiste) artiste = fallback.artiste;

    const coverLabel = coverSource
      ? coverSource === 'id3'
        ? 'pochette ID3'
        : 'pochette sidecar'
      : 'pas de pochette';
    console.log(`  · ${file} → ${id} (${coverLabel})`);

    tracks.push({ id, key, file, titre, artiste, coverExt });
  }

  return tracks;
}

function generateManifest(allTracks) {
  const byMood = { happy: [], sad: [], neutral: [] };
  for (const t of allTracks) {
    byMood[t.key].push(t);
  }

  let out = `/**
 * Généré par npm run sync-audio — ne pas éditer à la main.
 * Relancez le script après avoir ajouté des MP3 dans Happy/, Sad/ ou Neutral/.
 */
export type MoodKey = 'happy' | 'sad' | 'neutral';

export type TrackManifestEntry = {
  id: string;
  file: string;
  titre: string;
  artiste: string;
  hasCover: boolean;
};

export const PLAYLIST_MANIFEST: Record<MoodKey, TrackManifestEntry[]> = {
`;

  for (const { key } of MOOD_FOLDERS) {
    out += `  ${key}: [\n`;
    for (const t of byMood[key]) {
      out += `    {
      id: '${t.id}',
      file: '${escapeJs(t.file)}',
      titre: '${escapeJs(t.titre)}',
      artiste: '${escapeJs(t.artiste)}',
      hasCover: ${t.coverExt ? 'true' : 'false'},
    },\n`;
    }
    out += `  ],\n`;
  }

  out += `};\n`;
  return out;
}

function generateAudioRegistry(allTracks) {
  let out = `/**
 * Généré par npm run sync-audio
 */
export const AUDIO_REGISTRY: Record<string, number> = {
`;
  for (const t of allTracks) {
    const folder =
      t.key === 'happy' ? 'Happy' : t.key === 'sad' ? 'Sad' : 'Neutral';
    out += `  ${t.id}: require('./${folder}/${escapeJs(t.file)}'),\n`;
  }
  out += `};\n`;
  return out;
}

function generateCoversRegistry(allTracks) {
  let out = `/**
 * Généré par npm run sync-audio
 */
export const COVER_REGISTRY: Record<string, number> = {
`;
  for (const t of allTracks) {
    if (t.coverExt) {
      out += `  ${t.id}: require('./covers/${t.id}.${t.coverExt}'),\n`;
    }
  }
  out += `};\n`;
  return out;
}

async function main() {
  console.log('🎵 Sync audio — ID3 + images sidecar (même nom que le .mp3)\n');
  await ensureCoversDir();

  const allTracks = [];
  for (const mood of MOOD_FOLDERS) {
    console.log(`${mood.folder}:`);
    const tracks = await scanMood(mood);
    allTracks.push(...tracks);
    console.log('');
  }

  if (allTracks.length === 0) {
    console.warn('Aucun fichier audio trouvé.');
    process.exit(1);
  }

  await pruneOrphanCovers(allTracks.filter((t) => t.coverExt).map((t) => t.id));

  await fs.writeFile(
    path.join(AUDIO_ROOT, 'manifest.ts'),
    generateManifest(allTracks)
  );
  await fs.writeFile(
    path.join(AUDIO_ROOT, 'audioRegistry.ts'),
    generateAudioRegistry(allTracks)
  );
  await fs.writeFile(
    path.join(AUDIO_ROOT, 'coversRegistry.ts'),
    generateCoversRegistry(allTracks)
  );

  const withCover = allTracks.filter((t) => t.coverExt).length;
  const missing = allTracks.filter((t) => !t.coverExt);

  console.log(`✓ ${allTracks.length} morceaux indexés (${withCover} pochettes)`);
  if (missing.length > 0) {
    console.log('\nSans pochette (ajoutez une image à côté du MP3, même nom .jpg/.png) :');
    for (const t of missing) {
      const folder =
        t.key === 'happy' ? 'Happy' : t.key === 'sad' ? 'Sad' : 'Neutral';
      const base = t.file.replace(/\.(mp3|m4a|wav)$/i, '');
      console.log(`  - assets/audio/${folder}/${base}.jpg`);
    }
  }
  console.log('\n  → assets/audio/manifest.ts');
  console.log('  → assets/audio/audioRegistry.ts');
  console.log('  → assets/audio/coversRegistry.ts');
  console.log('\nRedémarrez Metro : npx expo start -c\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
