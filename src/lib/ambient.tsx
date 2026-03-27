"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

export type SceneId = "rain" | "cafe" | "forest" | "fireplace" | "lofi";

export interface Scene {
  id: SceneId;
  label: string;
  description: string;
  src: string;
  loop: boolean;
}

// Sound sources — Freesound.org CC previews + SomaFM lo-fi stream
// Swap any `src` with a direct .mp3 URL or stream URL to customise
export const SCENES: Scene[] = [
  {
    id: "rain",
    label: "Rain",
    description: "Soft rainfall on glass",
    src: "https://cdn.freesound.org/previews/346/346543-hq.mp3",
    loop: true,
  },
  {
    id: "cafe",
    label: "Café",
    description: "Quiet coffee shop murmur",
    src: "https://cdn.freesound.org/previews/517/517422-hq.mp3",
    loop: true,
  },
  {
    id: "forest",
    label: "Forest",
    description: "Birds and gentle breeze",
    src: "https://cdn.freesound.org/previews/425/425557-hq.mp3",
    loop: true,
  },
  {
    id: "fireplace",
    label: "Fireplace",
    description: "Crackling wood fire",
    src: "https://cdn.freesound.org/previews/274/274180-hq.mp3",
    loop: true,
  },
  {
    id: "lofi",
    label: "Lo-fi",
    description: "Soft ambient instrumental",
    src: "https://ice4.somafm.com/lofi-128-mp3",
    loop: false,
  },
];

interface AmbientState {
  activeScene: SceneId | null;
  isPlaying: boolean;
  volume: number;
  play: (id: SceneId) => void;
  stop: () => void;
  setVol: (v: number) => void;
}

const AmbientContext = createContext<AmbientState>({
  activeScene: null,
  isPlaying: false,
  volume: 0.5,
  play: () => {},
  stop: () => {},
  setVol: () => {},
});

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const audioRef                              = useRef<HTMLAudioElement | null>(null);
  const [activeScene, setActiveScene]         = useState<SceneId | null>(null);
  const [isPlaying,   setIsPlaying]           = useState(false);
  const [volume,      setVolume]              = useState(0.5);

  // Create a single Audio element for the lifetime of the app
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onEnded = () => { setIsPlaying(false); setActiveScene(null); };
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const play = useCallback((id: SceneId) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Clicking the active scene toggles it off
    if (activeScene === id && isPlaying) {
      audio.pause();
      setActiveScene(null);
      setIsPlaying(false);
      return;
    }

    const scene = SCENES.find((s) => s.id === id);
    if (!scene) return;

    audio.pause();
    audio.src   = scene.src;
    audio.loop  = scene.loop;
    audio.load();
    audio
      .play()
      .then(() => { setActiveScene(id); setIsPlaying(true); })
      .catch(() => { setIsPlaying(false); });
  }, [activeScene, isPlaying]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setActiveScene(null);
    setIsPlaying(false);
  }, []);

  return (
    <AmbientContext.Provider value={{ activeScene, isPlaying, volume, play, stop, setVol: setVolume }}>
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  return useContext(AmbientContext);
}
