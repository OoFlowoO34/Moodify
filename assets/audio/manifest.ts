export type MoodKey = 'happy' | 'sad' | 'neutral';

export type TrackManifestEntry = {
  id: string;
  titre: string;
  artiste: string;
  url: string;
};

const R2 = 'https://pub-737184233e9046d49decfd19b3ef9711.r2.dev/musics';

export const PLAYLIST_MANIFEST: Record<MoodKey, TrackManifestEntry[]> = {
  happy: [
    {
      id: 'happy_01',
      url: `${R2}/happy/01%20L'%20Hymne%20De%20Nos%20Campagnes.mp3`,
      titre: "L' Hymne De Nos Campagnes",
      artiste: 'Tryö',
    },
    {
      id: 'happy_02',
      url: `${R2}/happy/Justin%20Timberlake%20-%20SexyBack%20(Space%20Rangers%20Remix).mp3`,
      titre: 'SexyBack (Space Rangers Remix)',
      artiste: 'Justin Timberlake',
    },
    {
      id: 'happy_03',
      url: `${R2}/happy/Skepta%20-%20Rolex%20Sweep%20(Vandalism%20Remix).mp3`,
      titre: 'Rolex Sweep (Vandalism Remix)',
      artiste: 'Skepta',
    },
  ],
  sad: [
    {
      id: 'sad_01',
      url: `${R2}/sad/01%20-%20Trouble.mp3`,
      titre: 'Trouble',
      artiste: 'Damian Marley',
    },
    {
      id: 'sad_02',
      url: `${R2}/sad/01%20Ayo%20Technology.mp3`,
      titre: 'Ayo Technology',
      artiste: 'Milow',
    },
    {
      id: 'sad_03',
      url: `${R2}/sad/01%20Invaders%20Must%20Die%20-%20(Beezik%20remer.mp3`,
      titre: 'Invaders Must Die',
      artiste: 'The Prodigy',
    },
    {
      id: 'sad_04',
      url: `${R2}/sad/Rhyme-Crusaders-Stinky-Whores.mp3`,
      titre: 'Stinky Whores',
      artiste: 'Rhyme Crusaders',
    },
  ],
  neutral: [
    {
      id: 'neutral_01',
      url: `${R2}/neutral/02%20Aerodynamic.mp3`,
      titre: 'Aerodynamic',
      artiste: 'Daft Punk',
    },
    {
      id: 'neutral_02',
      url: `${R2}/neutral/03%20-%2010%2C000%20Chariots.mp3`,
      titre: '10,000 Chariots',
      artiste: 'Damian Marley',
    },
  ],
};
