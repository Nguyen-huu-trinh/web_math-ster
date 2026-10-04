"use client";

import { useEffect, useRef, useState } from "react";

interface YoutubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YoutubeApi {
  Player: new (element: HTMLIFrameElement, options: {
    events: { onReady: () => void; onError: () => void };
  }) => YoutubePlayer;
}

type YoutubeWindow = Window & {
  YT?: YoutubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YoutubeApi> | undefined;

function loadYoutubeApi() {
  const target = window as YoutubeWindow;
  if (target.YT?.Player) return Promise.resolve(target.YT);
  if (!apiPromise) {
    apiPromise = new Promise<YoutubeApi>((resolve, reject) => {
      const previousReady = target.onYouTubeIframeAPIReady;
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      target.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (target.YT?.Player) resolve(target.YT);
      };
      script.onerror = () => {
        apiPromise = undefined;
        target.onYouTubeIframeAPIReady = previousReady;
        script.remove();
        reject(new Error("Cannot load YouTube player API"));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

export function LessonVideoFrame({ src, title, onToggleFullscreen }: {
  src?: string;
  title: string;
  onToggleFullscreen: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  function cancelClick() {
    if (clickTimer.current !== null) clearTimeout(clickTimer.current);
    clickTimer.current = null;
  }

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !src) return;
    let disposed = false;
    let player: YoutubePlayer | null = null;
    setReady(false);
    // The API owns this iframe; React owns only the host, avoiding DOM conflicts.
    const iframe = document.createElement("iframe");
    iframe.title = title;
    iframe.className = "h-full w-full border-0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    const url = new URL(src, window.location.origin);
    const youtube = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].includes(url.hostname);
    if (youtube) {
      url.searchParams.set("enablejsapi", "1");
      url.searchParams.set("origin", window.location.origin);
    }
    iframe.src = url.href;
    host.appendChild(iframe);
    if (youtube) {
      void loadYoutubeApi().then((api) => {
        if (disposed) return;
        player = new api.Player(iframe, { events: {
          onReady: () => { if (!disposed) setReady(true); },
          onError: () => { if (!disposed) setReady(false); },
        } });
        playerRef.current = player;
      }).catch(() => {
        // Leave native iframe controls available if the API is blocked.
      });
    }
    return () => {
      disposed = true;
      cancelClick();
      playerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [src, title]);

  function togglePlayback() {
    const player = playerRef.current;
    if (!player) return;
    const state = player.getPlayerState();
    if (state === 1 || state === 3) player.pauseVideo();
    else player.playVideo();
  }

  return <div className="relative z-10 h-full w-full">
    <div ref={hostRef} className="h-full w-full" />
    {ready && <button
      type="button"
      aria-label="Phát hoặc tạm dừng video; nháy đúp để bật hoặc tắt toàn màn hình"
      className="absolute inset-x-0 top-0 bottom-16 z-10 cursor-default border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-amber-400"
      onClick={(event) => {
        event.stopPropagation();
        cancelClick();
        if (event.detail === 0) togglePlayback();
        else if (event.detail === 1) clickTimer.current = setTimeout(togglePlayback, 300);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        cancelClick();
        onToggleFullscreen();
      }}
    />}
  </div>;
}
