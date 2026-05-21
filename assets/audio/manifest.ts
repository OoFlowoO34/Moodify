/**
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
  happy: [
    {
      id: 'happy_01',
      file: '01 L\' Hymne De Nos Campagnes.mp3',
      titre: 'L\' Hymne De Nos Campagnes',
      artiste: 'Tryö',
      hasCover: false,
    },
    {
      id: 'happy_02',
      file: 'Justin Timberlake - SexyBack (Space Rangers Remix).mp3',
      titre: 'SexyBack (Space Rangers Remix)',
      artiste: 'Justin Timberlake',
      hasCover: false,
    },
    {
      id: 'happy_03',
      file: 'Skepta - Rolex Sweep (Vandalism Remix).mp3',
      titre: 'Rolex Sweep (Vandalism Remix)',
      artiste: 'Skepta',
      hasCover: true,
    },
  ],
  sad: [
    {
      id: 'sad_01',
      file: '01 - Trouble.mp3',
      titre: 'Trouble',
      artiste: 'Damian Marley',
      hasCover: true,
    },
    {
      id: 'sad_02',
      file: '01 Ayo Technology.mp3',
      titre: 'Ayo Technology',
      artiste: 'Milow',
      hasCover: true,
    },
    {
      id: 'sad_03',
      file: '01 Invaders Must Die - (Beezik remer.mp3',
      titre: 'Invaders Must Die - (Beezik remercie INPES)',
      artiste: 'The Prodigy',
      hasCover: true,
    },
    {
      id: 'sad_04',
      file: 'Rhyme-Crusaders-Stinky-Whores.mp3',
      titre: 'Stinky Whores',
      artiste: 'Rhyme Crusaders',
      hasCover: true,
    },
  ],
  neutral: [
    {
      id: 'neutral_01',
      file: '02 Aerodynamic.mp3',
      titre: 'Aerodynamic',
      artiste: 'Daft Punk',
      hasCover: false,
    },
    {
      id: 'neutral_02',
      file: '03 - 10,000 Chariots.mp3',
      titre: '10,000 Chariots',
      artiste: 'Damian Marley',
      hasCover: true,
    },
  ],
};
