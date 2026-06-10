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
import {
  buildShuffledQueue,
  pickRandomOther,
  shuffleTracks,
} from '@/utils/playback/shuffleQueue';

export interface MusicTrack {
  id: string;
  artiste: string;
  titre: string;
  url?: string;
  localAsset?: number;
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

  const shuffleEnabledRef = useRef(shuffleEnabled);
  const currentTrackRef = useRef(currentTrack);
  shuffleEnabledRef.current = shuffleEnabled;
  currentTrackRef.current = currentTrack;

  const rebuildQueue = useCallback(
    (list: MusicTrack[], shuffled: boolean, anchorId?: string | null) => {
      if (shuffled) {
        return buildShuffledQueue(list, anchorId);
      }
      return [...list];
    },
    []
  );

  // Nouvelle playlist : reconstruire la file en gardant le morceau en cours si possible.
  useEffect(() => {
    const anchor = currentTrackRef.current?.id;
    const anchorStillValid = anchor && musicList.some((t) => t.id === anchor);
    setPlayQueue(
      rebuildQueue(
        musicList,
        shuffleEnabledRef.current,
        anchorStillValid ? anchor : undefined
      )
    );
  }, [musicList, rebuildQueue]);

  useEffect(() => {
    setIsPlaying(status.playing);
  }, [status.playing]);

  const requestPlay = useCallback((track: MusicTrack) => {
    setCurrentTrack(track);
    setPlayRequestId((n) => n + 1);
  }, []);

  useEffect(() => {
    const source = currentTrack?.localAsset ?? (currentTrack?.url ? { uri: currentTrack.url } : null);
    if (!source || playRequestId === 0) return;

    const generation = ++loadGenerationRef.current;

    const loadAndPlay = async () => {
      try {
        player.pause();
        player.replace(source);
        if (generation !== loadGenerationRef.current) return;
        player.play();
      } catch {
        // Ignore native playback errors to prevent ghost playback side-effects
      }
    };

    loadAndPlay();

    return () => {
      loadGenerationRef.current += 1;
    };
  }, [currentTrack?.id, playRequestId, player]);

  const queueIndex = useMemo(() => {
    if (!currentTrack || playQueue.length === 0) return -1;
    return playQueue.findIndex((t) => t.id === currentTrack.id);
  }, [playQueue, currentTrack]);

  const canPlayPrevious = queueIndex > 0;

  const canPlayNext = useMemo(() => {
    if (musicList.length <= 1) return false;
    if (queueIndex >= 0 && queueIndex < playQueue.length - 1) return true;
    return shuffleEnabled;
  }, [musicList.length, queueIndex, playQueue.length, shuffleEnabled]);

  const playNext = useCallback(() => {
    if (queueIndex >= 0 && queueIndex < playQueue.length - 1) {
      requestPlay(playQueue[queueIndex + 1]);
      return;
    }

    if (!shuffleEnabled || musicList.length <= 1) return;

    const pick = pickRandomOther(musicList, currentTrack?.id);
    if (!pick) return;

    setPlayQueue((q) => [...q, pick]);
    requestPlay(pick);
  }, [queueIndex, playQueue, shuffleEnabled, musicList, currentTrack?.id, requestPlay]);

  const playPrevious = useCallback(() => {
    if (!canPlayPrevious) return;
    requestPlay(playQueue[queueIndex - 1]);
  }, [canPlayPrevious, playQueue, queueIndex, requestPlay]);

  const playTrack = useCallback(
    (track: MusicTrack) => {
      if (shuffleEnabledRef.current) {
        setPlayQueue(buildShuffledQueue(musicList, track.id));
      }
      requestPlay(track);
    },
    [musicList, requestPlay]
  );

  /** Nouvelle file mélangée + lecture du 1er morceau (relance l'aléatoire). */
  const playRandom = useCallback(() => {
    if (musicList.length === 0) return;

    const queue = shuffleTracks(musicList);
    const first = queue[0];

    setShuffleEnabled(true);
    setPlayQueue(queue);
    setCurrentTrack(first);
    setPlayRequestId((n) => n + 1);
  }, [musicList]);

  const toggleShuffle = useCallback(() => {
    const enabling = !shuffleEnabledRef.current;
    const anchor = currentTrackRef.current?.id;
    const anchorValid =
      anchor && musicList.some((t) => t.id === anchor) ? anchor : undefined;

    setShuffleEnabled(enabling);
    setPlayQueue(rebuildQueue(musicList, enabling, anchorValid));
    // Ne relance pas le morceau : la lecture en cours continue.
  }, [musicList, rebuildQueue]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack?.localAsset && !currentTrack?.url) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [currentTrack?.localAsset, currentTrack?.url, status.playing, player]);

  const duration = status.duration > 0 ? status.duration : 0;

  const seekTo = useCallback(
    (seconds: number) => {
      if ((!currentTrack?.localAsset && !currentTrack?.url) || duration <= 0) return;
      const clamped = Math.max(0, Math.min(seconds, duration));
      player.seekTo(clamped);
    },
    [currentTrack?.localAsset, currentTrack?.url, duration, player]
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
      canPlayCurrent: !!(currentTrack?.localAsset || currentTrack?.url),
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
