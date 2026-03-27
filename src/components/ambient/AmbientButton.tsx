"use client";

import { useState, useRef, useEffect } from "react";
import {
  Headphones,
  CloudRain,
  Coffee,
  Leaf,
  Flame,
  Music2,
  Volume2,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAmbient, SCENES, type SceneId } from "@/lib/ambient";

const ICONS: Record<SceneId, React.ElementType> = {
  rain:      CloudRain,
  cafe:      Coffee,
  forest:    Leaf,
  fireplace: Flame,
  lofi:      Music2,
};

export function AmbientButton() {
  const [open, setOpen]                                   = useState(false);
  const wrapRef                                           = useRef<HTMLDivElement>(null);
  const { activeScene, isPlaying, volume, play, stop, setVol } = useAmbient();

  // Close panel when clicking outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>

      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Focus sounds"
        aria-expanded={open}
        className={cn(
          "relative w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200",
          isPlaying
            ? "border-gold text-gold bg-gold/10"
            : "border-parchment-deep text-ink-faint hover:text-ink hover:border-ink-faint"
        )}
      >
        <Headphones className="w-3.5 h-3.5" strokeWidth={1.8} />
        {isPlaying && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        )}
      </button>

      {/* ── Floating panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] w-[228px] rounded-xl z-50 overflow-hidden",
            "bg-parchment border border-parchment-deep",
            "shadow-[0_12px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]",
            "animate-fade-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b border-parchment-deep">
            <div className="flex items-center gap-2">
              <Headphones className="w-3 h-3 text-ink-faint" strokeWidth={1.5} />
              <p className="text-[11px] font-serif font-semibold text-ink tracking-wide">
                Focus Sounds
              </p>
            </div>
            {isPlaying && (
              <button
                onClick={stop}
                className="flex items-center gap-1 text-[10px] text-ink-muted hover:text-ink transition-colors"
              >
                <Square className="w-2 h-2" fill="currentColor" strokeWidth={0} />
                Stop
              </button>
            )}
          </div>

          {/* Scene grid */}
          <div className="grid grid-cols-5 gap-1 p-2">
            {SCENES.map((scene) => {
              const Icon   = ICONS[scene.id];
              const active = activeScene === scene.id && isPlaying;

              return (
                <button
                  key={scene.id}
                  onClick={() => play(scene.id)}
                  title={`${scene.label} — ${scene.description}`}
                  className={cn(
                    "flex flex-col items-center justify-center gap-[5px] py-3 rounded-xl transition-all duration-200",
                    active
                      ? "bg-gold/10 text-gold-dark"
                      : "text-ink-muted hover:text-ink hover:bg-parchment-warm"
                  )}
                >
                  <Icon className="w-[15px] h-[15px] shrink-0" strokeWidth={1.5} />
                  <span className="text-[8px] font-medium leading-none tracking-wide">
                    {scene.label}
                  </span>

                  {/* Animated equaliser bars when active */}
                  {active ? (
                    <div className="flex items-end gap-[2px]" style={{ height: 8 }}>
                      <span className="sound-bar w-[2px] rounded-sm bg-gold"  style={{ animationDelay: "0ms"   }} />
                      <span className="sound-bar w-[2px] rounded-sm bg-gold"  style={{ animationDelay: "180ms" }} />
                      <span className="sound-bar w-[2px] rounded-sm bg-gold"  style={{ animationDelay: "90ms"  }} />
                    </div>
                  ) : (
                    <div style={{ height: 8 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active scene description */}
          {isPlaying && activeScene && (
            <div className="px-3.5 pb-1.5">
              <p className="text-[10px] text-ink-faint italic leading-relaxed">
                {SCENES.find((s) => s.id === activeScene)?.description}
              </p>
            </div>
          )}

          {/* Volume slider */}
          <div className="flex items-center gap-2.5 px-3.5 pt-2 pb-3.5">
            <Volume2 className="w-3 h-3 text-ink-faint shrink-0" strokeWidth={1.5} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="flex-1 h-[3px] accent-gold cursor-pointer rounded-full"
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
