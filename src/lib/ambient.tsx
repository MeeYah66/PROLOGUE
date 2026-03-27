"use client";

import { createContext, useContext, useRef, useState, useCallback } from "react";

export type SceneId = "rain" | "cafe" | "forest" | "fireplace" | "lofi";

export interface Scene {
  id: SceneId;
  label: string;
  description: string;
  /** Present only for stream-based scenes (HTMLAudioElement) */
  stream?: string;
}

// Nature scenes use Web Audio API (no external files needed).
// Lo-fi uses SomaFM's Groove Salad ambient stream.
export const SCENES: Scene[] = [
  { id: "rain",      label: "Rain",      description: "Soft rainfall"            },
  { id: "cafe",      label: "Café",      description: "Coffee shop murmur"       },
  { id: "forest",    label: "Forest",    description: "Birds & gentle breeze"    },
  { id: "fireplace", label: "Fireplace", description: "Crackling wood fire"      },
  { id: "lofi",      label: "Lo-fi",     description: "Ambient instrumental",
    stream: "https://ice2.somafm.com/groovesalad-128-mp3"                        },
];

// ─── Web Audio generators ─────────────────────────────────────────────────────

interface Nodes { stop: () => void }

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const buf  = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function brownBuffer(ctx: AudioContext): AudioBuffer {
  const buf  = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    data[i] = last * 4;
  }
  return buf;
}

function makeSource(ctx: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop   = true;
  return src;
}

/** Rain — white noise through a soft lowpass: gentle "shhhh" */
function genRain(ctx: AudioContext, out: GainNode): Nodes {
  const src  = makeSource(ctx, noiseBuffer(ctx));
  const lp   = ctx.createBiquadFilter();
  lp.type            = "lowpass";
  lp.frequency.value = 550;
  lp.Q.value         = 0.5;
  const g = ctx.createGain(); g.gain.value = 0.9;
  src.connect(lp); lp.connect(g); g.connect(out);
  src.start();
  return { stop: () => { try { src.stop(); } catch { /**/ } } };
}

/** Café — bandpass noise in the human-voice range: soft crowd murmur */
function genCafe(ctx: AudioContext, out: GainNode): Nodes {
  const src = makeSource(ctx, noiseBuffer(ctx));
  const hp  = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 280;
  const lp  = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 2000;
  const g   = ctx.createGain(); g.gain.value = 0.38;
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
  src.start();
  return { stop: () => { try { src.stop(); } catch { /**/ } } };
}

/** Forest — airy bandpass for wind + high shimmer for leaves/birds */
function genForest(ctx: AudioContext, out: GainNode): Nodes {
  // Wind layer
  const windSrc = makeSource(ctx, noiseBuffer(ctx));
  const windLp  = ctx.createBiquadFilter(); windLp.type = "lowpass"; windLp.frequency.value = 700;
  const windG   = ctx.createGain(); windG.gain.value = 0.25;

  // Leaf/bird shimmer layer
  const shimSrc = makeSource(ctx, noiseBuffer(ctx));
  const shimBp  = ctx.createBiquadFilter(); shimBp.type = "bandpass"; shimBp.frequency.value = 3500; shimBp.Q.value = 0.4;
  const shimG   = ctx.createGain(); shimG.gain.value = 0.18;

  windSrc.connect(windLp); windLp.connect(windG); windG.connect(out);
  shimSrc.connect(shimBp); shimBp.connect(shimG); shimG.connect(out);
  windSrc.start(); shimSrc.start();

  return { stop: () => { try { windSrc.stop(); shimSrc.stop(); } catch { /**/ } } };
}

/** Fireplace — brown noise through deep lowpass: warm, low crackle */
function genFireplace(ctx: AudioContext, out: GainNode): Nodes {
  const src = makeSource(ctx, brownBuffer(ctx));
  const lp  = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 280;
  const g   = ctx.createGain(); g.gain.value = 0.7;
  src.connect(lp); lp.connect(g); g.connect(out);
  src.start();
  return { stop: () => { try { src.stop(); } catch { /**/ } } };
}

const GENERATORS: Partial<Record<SceneId, (ctx: AudioContext, out: GainNode) => Nodes>> = {
  rain:      genRain,
  cafe:      genCafe,
  forest:    genForest,
  fireplace: genFireplace,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AmbientState {
  activeScene: SceneId | null;
  isPlaying:   boolean;
  volume:      number;
  play:        (id: SceneId) => void;
  stop:        () => void;
  setVol:      (v: number) => void;
}

const AmbientContext = createContext<AmbientState>({
  activeScene: null,
  isPlaying:   false,
  volume:      0.5,
  play:  () => {},
  stop:  () => {},
  setVol: () => {},
});

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const ctxRef    = useRef<AudioContext | null>(null);
  const gainRef   = useRef<GainNode    | null>(null);
  const nodesRef  = useRef<Nodes       | null>(null);   // Web Audio nodes
  const streamRef = useRef<HTMLAudioElement | null>(null); // for Lo-fi stream

  const [activeScene, setActiveScene] = useState<SceneId | null>(null);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [volume,      setVolume]      = useState(0.5);

  /** Lazy-init AudioContext — only created after a user gesture */
  function getCtx(): { ctx: AudioContext; gain: GainNode } {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ctx  = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      ctxRef.current  = ctx;
      gainRef.current = gain;
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return { ctx: ctxRef.current, gain: gainRef.current! };
  }

  function stopAll() {
    nodesRef.current?.stop();
    nodesRef.current = null;
    if (streamRef.current) {
      streamRef.current.pause();
      streamRef.current.src = "";
    }
  }

  const play = useCallback((id: SceneId) => {
    // Clicking the active scene toggles it off
    if (activeScene === id && isPlaying) {
      stopAll();
      setActiveScene(null);
      setIsPlaying(false);
      return;
    }

    stopAll();

    const scene = SCENES.find((s) => s.id === id);
    if (!scene) return;

    if (scene.stream) {
      // ── Stream (Lo-fi) ────────────────────────────────────────────────
      if (!streamRef.current) streamRef.current = new Audio();
      const audio   = streamRef.current;
      audio.src     = scene.stream;
      audio.loop    = false;
      audio.volume  = volume;
      audio.load();
      audio.play()
        .then(() => { setActiveScene(id); setIsPlaying(true); })
        .catch(() => {});
    } else {
      // ── Web Audio generator ───────────────────────────────────────────
      const gen = GENERATORS[id];
      if (!gen) return;
      const { ctx, gain } = getCtx();
      nodesRef.current = gen(ctx, gain);
      setActiveScene(id);
      setIsPlaying(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene, isPlaying, volume]);

  const stop = useCallback(() => {
    stopAll();
    setActiveScene(null);
    setIsPlaying(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setVol = useCallback((v: number) => {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
    if (streamRef.current) streamRef.current.volume = v;
  }, []);

  return (
    <AmbientContext.Provider value={{ activeScene, isPlaying, volume, play, stop, setVol }}>
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  return useContext(AmbientContext);
}
