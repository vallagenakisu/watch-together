"use client";

import { useEffect, useRef } from "react";
import type { WatchParty } from "@/lib/useWatchParty";
import { useYouTubeApi, YT_STATE, type YTPlayer } from "@/lib/youtube";

const DRIFT_TOLERANCE = 0.75;
const SEEK_THRESHOLD = 1.25;

interface Props { party: WatchParty; }

export function SyncedPlayer({ party }: Props) {
  const api = useYouTubeApi();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const applyingRemote = useRef(false);
  const lastTickTime = useRef(0);
  const lastTickAt = useRef(0);
  const loadedVideoId = useRef<string | null>(null);

  const room = party.room;
  const videoId = room?.videoId ?? null;
  const { sendControl, subscribeControl } = party;

  const withRemoteGuard = (fn: () => void) => {
    applyingRemote.current = true;
    fn();
    window.setTimeout(() => { applyingRemote.current = false; }, 800);
  };

  function loadVideo(player: YTPlayer, id: string, time: number, playing: boolean) {
    loadedVideoId.current = id;
    withRemoteGuard(() => {
      if (playing) player.loadVideoById({ videoId: id, startSeconds: time });
      else player.cueVideoById({ videoId: id, startSeconds: time });
    });
  }

  useEffect(() => {
    if (!api || !containerRef.current || playerRef.current) return;
    const player = new api.Player(containerRef.current, {
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          if (room?.videoId) loadVideo(player, room.videoId, room.currentTime, room.isPlaying);
        },
        onStateChange: (e) => {
          if (applyingRemote.current) return;
          const time = e.target.getCurrentTime();
          if (e.data === YT_STATE.PLAYING) sendControl({ kind: "play", time });
          else if (e.data === YT_STATE.PAUSED) sendControl({ kind: "pause", time });
        },
      },
    });
    playerRef.current = player;
    return () => { player.destroy(); playerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !videoId || videoId === loadedVideoId.current) return;
    loadVideo(player, videoId, room?.currentTime ?? 0, room?.isPlaying ?? false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    return subscribeControl((action) => {
      const player = playerRef.current;
      if (!player) return;
      switch (action.kind) {
        case "play":
          withRemoteGuard(() => {
            if (Math.abs(player.getCurrentTime() - action.time) > DRIFT_TOLERANCE) player.seekTo(action.time, true);
            player.playVideo();
          });
          break;
        case "pause":
          withRemoteGuard(() => {
            if (Math.abs(player.getCurrentTime() - action.time) > DRIFT_TOLERANCE) player.seekTo(action.time, true);
            player.pauseVideo();
          });
          break;
        case "seek":
          withRemoteGuard(() => player.seekTo(action.time, true));
          break;
        case "set_video":
          break;
      }
    });
  }, [subscribeControl]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || applyingRemote.current) return;
      if (typeof player.getCurrentTime !== "function") return;
      const now = Date.now();
      const actual = player.getCurrentTime();
      const playing = player.getPlayerState() === YT_STATE.PLAYING;
      if (lastTickAt.current !== 0) {
        const expected = playing ? lastTickTime.current + (now - lastTickAt.current) / 1000 : lastTickTime.current;
        if (Math.abs(actual - expected) > SEEK_THRESHOLD) sendControl({ kind: "seek", time: actual });
      }
      lastTickTime.current = actual;
      lastTickAt.current = now;
    }, 500);
    return () => window.clearInterval(interval);
  }, [sendControl]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {!videoId && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          No video yet — paste a YouTube URL in the panel on the right.
        </div>
      )}
    </div>
  );
}
