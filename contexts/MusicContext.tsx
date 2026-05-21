import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { shuffleTracks } from '@/utils/playback/shuffleQueue';

export interface MusicTrack {
  id: string;
  artiste: string;
  titre: string;
  url?: string;
  localAsset?: number;
  /** Pochette extraite des métadonnées ID3 (require) */
  coverAsset?: number;
  mood?: string;
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
  shuffleEnabled: boolean;
  playQueue: MusicTrack[];
  playTrack: (track: MusicTrack) => void;
  playRandom: () => void;
  playNext: () => void;
  playPrevious: () => void;
  canPlayPrevious: boolean;
  canPlayNext: boolean;
  toggleShuffle: () => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  canPlayCurrent: boolean;
  playbackProgress: number;
  playbackPosition: number;
  playbackDuration: number;
  didJustFinish: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const loadGenerationRef = useRef(0);

  const [musicList, setMusicList] = useState<MusicTrack[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [playQueue, setPlayQueue] = useState<MusicTrack[]>([]);
  const [playRequestId, setPlayRequestId] = useState(0);

  useEffect(() => {
    setPlayQueue(shuffleEnabled ? shuffleTracks(musicList) : [...musicList]);
  }, [musicList, shuffleEnabled]);

  useEffect(() => {
    setIsPlaying(status.playing);
  }, [status.playing]);

  const requestPlay = useCallback((track: MusicTrack) => {
    setCurrentTrack(track);
    setPlayRequestId((n) => n + 1);
  }, []);

  useEffect(() => {
    const asset = currentTrack?.localAsset;
    if (!asset || playRequestId === 0) return;

    const generation = ++loadGenerationRef.current;

    const loadAndPlay = async () => {
      try {
        player.pause();
        player.replace(asset);
        if (generation !== loadGenerationRef.current) return;
        player.play();
      } catch {
        // ignore — évite les lectures fantômes en cas d'erreur native
      }
    };

    loadAndPlay();

    return () => {
      loadGenerationRef.current += 1;
    };
  }, [currentTrack?.id, playRequestId, player]);

  const playTrack = useCallback(
    (track: MusicTrack) => {
      requestPlay(track);
    },
    [requestPlay]
  );

  const queueIndex = useMemo(() => {
    if (!currentTrack || playQueue.length === 0) return -1;
    return playQueue.findIndex((t) => t.id === currentTrack.id);
  }, [playQueue, currentTrack]);

  const canPlayPrevious = queueIndex > 0;
  const canPlayNext =
    queueIndex >= 0 && queueIndex < playQueue.length - 1;

  const playNext = useCallback(() => {
    if (!canPlayNext) return;
    requestPlay(playQueue[queueIndex + 1]);
  }, [canPlayNext, playQueue, queueIndex, requestPlay]);

  const playPrevious = useCallback(() => {
    if (!canPlayPrevious) return;
    requestPlay(playQueue[queueIndex - 1]);
  }, [canPlayPrevious, playQueue, queueIndex, requestPlay]);

  const playRandom = useCallback(() => {
    if (musicList.length === 0) return;

    setShuffleEnabled(true);
    const shuffled = shuffleTracks(musicList);
    setPlayQueue(shuffled);
    const pick = shuffled[Math.floor(Math.random() * shuffled.length)];
    requestPlay(pick);
  }, [musicList, requestPlay]);

  const toggleShuffle = useCallback(() => {
    setShuffleEnabled((prev) => !prev);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack?.localAsset) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [currentTrack?.localAsset, status.playing, player]);

  const duration = status.duration > 0 ? status.duration : 0;

  const seekTo = useCallback(
    (seconds: number) => {
      if (!currentTrack?.localAsset || duration <= 0) return;
      const clamped = Math.max(0, Math.min(seconds, duration));
      player.seekTo(clamped);
    },
    [currentTrack?.localAsset, duration, player]
  );
  const position = status.currentTime ?? 0;
  const playbackProgress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const value = useMemo(
    () => ({
      musicList,
      setMusicList,
      selectedMood,
      setSelectedMood,
      isLoading,
      setIsLoading,
      currentTrack,
      setCurrentTrack,
      isPlaying,
      shuffleEnabled,
      playQueue,
      playTrack,
      playRandom,
      playNext,
      playPrevious,
      canPlayPrevious,
      canPlayNext,
      toggleShuffle,
      togglePlayPause,
      seekTo,
      canPlayCurrent: currentTrack?.localAsset != null,
      playbackProgress,
      playbackPosition: position,
      playbackDuration: duration,
      didJustFinish: status.didJustFinish ?? false,
    }),
    [
      musicList,
      selectedMood,
      isLoading,
      currentTrack,
      isPlaying,
      shuffleEnabled,
      playQueue,
      playTrack,
      playRandom,
      playNext,
      playPrevious,
      canPlayPrevious,
      canPlayNext,
      toggleShuffle,
      togglePlayPause,
      seekTo,
      playbackProgress,
      position,
      duration,
      status.didJustFinish,
    ]
  );

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
}
