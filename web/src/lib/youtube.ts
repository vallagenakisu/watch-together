"use client";

import { useEffect, useState } from "react";

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  cueVideoById(opts: { videoId: string; startSeconds?: number }): void;
  destroy(): void;
}

export const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: {
    videoId?: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (e: { target: YTPlayer }) => void;
      onStateChange?: (e: { data: number; target: YTPlayer }) => void;
    };
  }) => YTPlayer;
}

declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void; }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT!); };
    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

export function useYouTubeApi(): YTNamespace | null {
  const [api, setApi] = useState<YTNamespace | null>(null);
  useEffect(() => {
    let active = true;
    loadApi().then((yt) => { if (active) setApi(yt); });
    return () => { active = false; };
  }, []);
  return api;
}
