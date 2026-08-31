"use client";

import { useEffect, useRef, useState } from "react";
import { IconMusic } from "@/components/icons";

export interface MusicPlayerProps {
  src: string | null;
  accent: string;
  ink: string;
  surface: string;
}

export default function MusicPlayer({ src, accent, ink, surface }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!src) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [src]);

  function startAndToggle() {
    if (!src) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (!started) {
      setStarted(true);
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* autoplay blocked silently */
        });
      return;
    }
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  if (!src || !visible) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        onClick={startAndToggle}
        aria-label={playing ? "Matikan musik" : "Putar musik"}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${accent} ${ink} ${surface}`}
      >
        <IconMusic className={`h-6 w-6 ${playing ? "" : "opacity-70"}`} />
      </button>
    </>
  );
}
