import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MusicTrack {
  artiste: string;
  titre: string;
  url: string;
}

interface MusicContextType {
  musicList: MusicTrack[];
  setMusicList: (list: MusicTrack[]) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentTrack: MusicTrack | null;
  setCurrentTrack: (track: MusicTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <MusicContext.Provider
      value={{
        musicList,
        setMusicList,
        selectedMood,
        setSelectedMood,
        isLoading,
        setIsLoading,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
}
