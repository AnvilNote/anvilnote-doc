"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

// Deliberately no native <video controls> (an all-or-nothing browser UI that
// always includes a scrubber) — just a play/pause toggle, no progress bar,
// no time, no volume.
export function DemoVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative block w-full cursor-pointer"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      <video
        ref={videoRef}
        className="block h-auto w-full"
        playsInline
        preload="metadata"
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors",
          !isPlaying && "bg-black/20 group-hover:bg-black/30",
        )}
      >
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg transition-opacity",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          )}
        >
          {isPlaying ? (
            <Pause className="size-6" fill="currentColor" />
          ) : (
            <Play className="ml-1 size-6" fill="currentColor" />
          )}
        </span>
      </div>
    </button>
  );
}
