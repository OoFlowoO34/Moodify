# Musiques locales Moodify

Placez vos **MP3** dans le dossier correspondant à l'humeur :

```
assets/audio/
  Happy/
  Sad/
  Neutral/
  covers/          ← pochettes générées (ne pas éditer à la main)
```

## Ajouter ou mettre à jour des morceaux

1. Copiez vos fichiers `.mp3` dans `Happy/`, `Sad/` ou `Neutral/`.
2. **Pochettes** — deux méthodes :
   - **Recommandé si Musique ne les enregistre pas dans le fichier :** placez une image **à côté** du MP3, **même nom** :
     - `Happy/Skepta - Rolex Sweep (Vandalism Remix).mp3`
     - `Happy/Skepta - Rolex Sweep (Vandalism Remix).jpg`
   - Ou embarquez la pochette dans le MP3 avec Mp3tag / Picard (tag ID3).
3. Lancez la synchronisation :

```bash
npm run sync-audio
```

Le script lit les tags ID3, copie les images sidecar dans `covers/`, et embarque les sidecar dans le MP3 si besoin.

4. Redémarrez Metro : `npx expo start -c`

Fichiers régénérés :

- `manifest.ts` — titres, artistes, `hasCover`
- `audioRegistry.ts` — `require()` vers les MP3
- `coversRegistry.ts` — `require()` vers les images dans `covers/`

Sans tag ID3 ni image sidecar, le titre est déduit du nom de fichier (`Artiste - Titre.mp3`).
